// src/components/Instructor/InstructorChat.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { socket } from "@/lib/socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetAllInstructorConversationsQuery,
  useSendMessageMutation,
  useMarkMessageAsReadMutation,
} from "@/redux/services/chatApi";
import { addMessage } from "@/redux/slices/chatSlice";
import { Eye } from "lucide-react";

interface ChatPreview {
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  lastMessage: string;
  unreadCount: number;
}

interface Message {
  _id: string;
  courseId: string;
  senderId: string;
  recipientId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  courseTitle?: string;
  senderName?: string;
  role?: "student" | "instructor";
}

export default function InstructorChat() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { messages: allMessages } = useSelector(
    (state: RootState) => state.chat
  );
  const dispatch = useDispatch();
  const [selectedChat, setSelectedChat] = useState<ChatPreview | null>(null);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: conversationData, refetch } =
    useGetAllInstructorConversationsQuery(
      { trainerId: user?.id || "" },
      { skip: !user }
    );
  const [sendMessage] = useSendMessageMutation();
  const [markMessageAsRead] = useMarkMessageAsReadMutation();

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer)
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const onConnect = () => {
      console.log("Instructor connected to socket:", socket.id);
      socket.emit("joinInstructorRoom", { instructorId: user?.id });
      console.log(`Instructor joined room: instructor_${user?.id}`);
      chatPreviews.forEach((preview) => {
        const room = `chat_${preview.courseId}_${preview.studentId}`;
        socket.emit("joinChatRoom", {
          courseId: preview.courseId,
          userId: preview.studentId,
        });
        console.log(`Instructor joined room: ${room}`);
      });
    };

    const onNewMessage = (message: Message) => {
      console.log("Instructor received newMessage:", message);
      if (
        selectedChat &&
        message.courseId === selectedChat.courseId &&
        ((message.senderId === selectedChat.studentId &&
          message.recipientId === user?.id) ||
          (message.senderId === user?.id &&
            message.recipientId === selectedChat.studentId))
      ) {
        setDisplayedMessages((prev) => {
          const tempIndex = prev.findIndex(
            (msg) =>
              msg._id.startsWith("temp-") && msg.message === message.message
          );
          if (tempIndex >= 0) {
            const newMessages = [...prev];
            newMessages[tempIndex] = message;
            return newMessages;
          }
          return prev.some((msg) => msg._id === message._id)
            ? prev
            : [...prev, message];
        });
        dispatch(addMessage(message));
        scrollToBottom();
      }
    };

    const onNewChatMessage = (message: Message) => {
      console.log("Instructor received newChatMessage:", message);
      if (message.recipientId === user?.id && message.senderId !== user?.id) {
        const room = `chat_${message.courseId}_${message.senderId}`;
        socket.emit("joinChatRoom", {
          courseId: message.courseId,
          userId: message.senderId,
        });
        console.log(`Instructor dynamically joined room: ${room}`);
        dispatch(addMessage(message));
        updateChatPreviews(message);
      }
    };

    const onMessageRead = (updatedMessage: Message) => {
      console.log("Instructor received messageRead:", updatedMessage);
      dispatch(addMessage(updatedMessage));
      if (
        selectedChat &&
        updatedMessage.courseId === selectedChat.courseId &&
        (updatedMessage.senderId === user?.id ||
          updatedMessage.senderId === selectedChat.studentId)
      ) {
        setDisplayedMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
        updateChatPreviews(updatedMessage);
        scrollToBottom();
      }
    };

    const onDisconnect = () => {
      console.log("Instructor disconnected from socket");
    };

    socket.on("connect", onConnect);
    socket.on("newMessage", onNewMessage);
    socket.on("newChatMessage", onNewChatMessage);
    socket.on("messageRead", onMessageRead);
    socket.on("disconnect", onDisconnect);

    if (!socket.connected) socket.connect();
    else onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("newMessage", onNewMessage);
      socket.off("newChatMessage", onNewChatMessage);
      socket.off("messageRead", onMessageRead);
      socket.off("disconnect", onDisconnect);
    };
  }, [user?.id, chatPreviews, selectedChat, dispatch, scrollToBottom]);

  useEffect(() => {
    if (conversationData?.data) {
      const allMessages = conversationData.data.map((msg: any) => ({
        ...msg,
        courseId: msg.courseId._id,
        senderId: msg.senderId._id,
        recipientId: msg.recipientId._id,
        courseTitle: msg.courseId.title,
        senderName: msg.senderId.name,
      }));
      dispatch({ type: "chat/setMessages", payload: allMessages });

      const previewMap = new Map<string, ChatPreview>();
      allMessages.forEach((msg: Message) => {
        const studentId =
          msg.senderId !== user?.id ? msg.senderId : msg.recipientId;
        const key = `${studentId}-${msg.courseId}`;
        if (!previewMap.has(key)) {
          previewMap.set(key, {
            courseId: msg.courseId,
            courseTitle: msg.courseTitle || "Unknown Course",
            studentId: studentId,
            studentName:
              msg.senderId === user?.id
                ? msg.recipientId.name
                : msg.senderName || "Unknown Student",
            lastMessage: msg.message,
            unreadCount: msg.isRead ? 0 : 1,
          });
        } else {
          const preview = previewMap.get(key)!;
          preview.lastMessage = msg.message;
          if (!msg.isRead && msg.senderId !== user?.id)
            preview.unreadCount += 1;
        }
      });
      setChatPreviews(Array.from(previewMap.values()));
    }
  }, [conversationData, user, dispatch]);

  useEffect(() => {
    if (selectedChat) {
      displayedMessages.forEach((msg) => {
        if (
          msg.recipientId === user?.id &&
          !msg.isRead &&
          msg.senderId === selectedChat.studentId
        ) {
          markMessageAsRead(msg._id).catch((error) =>
            console.error("Failed to mark message as read:", error)
          );
        }
      });
      scrollToBottom();
    }
  }, [
    displayedMessages,
    selectedChat,
    user?.id,
    markMessageAsRead,
    scrollToBottom,
  ]);

  const updateChatPreviews = (message: Message) => {
    console.log("Updating chat previews with message:", message);
    setChatPreviews((prev) => {
      const studentId =
        message.senderId !== user?.id ? message.senderId : message.recipientId;
      const key = `${studentId}-${message.courseId}`;
      const existing = prev.find(
        (chat) => `${chat.studentId}-${chat.courseId}` === key
      );

      if (existing) {
        console.log(`Updating existing preview for ${key}`);
        return prev.map((chat) =>
          chat.studentId === studentId && chat.courseId === message.courseId
            ? {
                ...chat,
                lastMessage: message.message,
                unreadCount: message.isRead ? 0 : chat.unreadCount + 1,
              }
            : chat
        );
      } else {
        console.log(`Adding new preview for ${key}`);
        const newPreview = {
          courseId: message.courseId,
          courseTitle: message.courseTitle || "Unknown Course",
          studentId: studentId,
          studentName: message.senderName || "Unknown Student",
          lastMessage: message.message,
          unreadCount: message.isRead ? 0 : 1,
        };
        return [...prev, newPreview];
      }
    });
  };

  const handleSelectChat = (chat: ChatPreview) => {
    setSelectedChat(chat);
    const filteredMessages = allMessages.filter(
      (msg) =>
        msg.courseId === chat.courseId &&
        ((msg.senderId === chat.studentId && msg.recipientId === user?.id) ||
          (msg.recipientId === chat.studentId && msg.senderId === user?.id))
    );
    setDisplayedMessages(filteredMessages);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      courseId: selectedChat.courseId,
      senderId: user?.id || "",
      recipientId: selectedChat.studentId,
      message: newMessage,
    };

    const tempMessage: Message = {
      ...messageData,
      _id: `temp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      courseTitle: selectedChat.courseTitle,
      senderName: user.name,
      role: "instructor",
    };
    setDisplayedMessages((prev) => [...prev, tempMessage]);
    updateChatPreviews(tempMessage);
    scrollToBottom();

    try {
      const savedMessage = await sendMessage(messageData).unwrap();
      const enrichedMessage = {
        ...savedMessage.data,
        courseTitle: selectedChat.courseTitle,
        senderName: user.name,
        role: "instructor",
      };
      console.log(
        "Instructor sending savedMessage via socket:",
        enrichedMessage
      );
      socket.emit("sendMessage", enrichedMessage);
      setDisplayedMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? enrichedMessage : msg))
      );
      setNewMessage("");
      refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
      setDisplayedMessages((prev) =>
        prev.filter((msg) => msg._id !== tempMessage._id)
      );
      updateChatPreviews(tempMessage);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      <Card className="lg:col-span-1 shadow-lg rounded-xl border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-16rem)] bg-gray-50">
            {chatPreviews.map((chat) => (
              <div
                key={`${chat.studentId}-${chat.courseId}`}
                onClick={() => handleSelectChat(chat)}
                className={`flex items-center p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedChat?.studentId === chat.studentId &&
                  selectedChat?.courseId === chat.courseId
                    ? "bg-gray-200"
                    : ""
                }`}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage
                    src={`/placeholder-avatar.jpg`}
                    alt={chat.studentName}
                  />
                  <AvatarFallback className="bg-gray-300 text-gray-700">
                    {chat.studentName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800 truncate">
                      {chat.studentName} - {chat.courseTitle}
                    </span>
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 shadow-lg rounded-xl border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="text-xl font-semibold text-gray-800">
            {selectedChat
              ? `Chat with ${selectedChat.studentName} - ${selectedChat.courseTitle}`
              : "Select a Chat"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100vh-16rem)] p-0">
          {selectedChat ? (
            <>
              <ScrollArea
                ref={scrollAreaRef}
                className="flex-1 h-0 p-4 bg-gray-50"
              >
                <div className="space-y-4">
                  {displayedMessages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.senderId === user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 Instytrounded-lg shadow-sm ${
                          msg.senderId === user?.id
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <div className="flex items-center justify-end mt-1 text-xs text-gray-400">
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {msg.senderId === user?.id && msg.isRead && (
                            <Eye className="w-3 h-3 ml-1 text-gray-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
              Select a student and course to start chatting
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
