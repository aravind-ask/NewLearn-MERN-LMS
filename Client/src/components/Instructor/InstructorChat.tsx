// src/components/Instructor/InstructorChat.tsx
import { useEffect, useState, useRef } from "react";
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
} from "@/redux/services/chatApi";
import { addMessage } from "@/redux/slices/chatSlice";

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
          // Replace temp message if it exists, otherwise add
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
        updateChatPreviews(message);
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

    const onDisconnect = () => {
      console.log("Instructor disconnected from socket");
    };

    socket.on("connect", onConnect);
    socket.on("newMessage", onNewMessage);
    socket.on("newChatMessage", onNewChatMessage);
    socket.on("disconnect", onDisconnect);

    if (!socket.connected) {
      console.log("Socket not connected, attempting to connect...");
      socket.connect();
    } else {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("newMessage", onNewMessage);
      socket.off("newChatMessage", onNewChatMessage);
      socket.off("disconnect", onDisconnect);
    };
  }, [user?.id, chatPreviews, selectedChat, dispatch]);

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
                unreadCount:
                  message.isRead || message.senderId === user?.id
                    ? chat.unreadCount
                    : chat.unreadCount + 1,
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
          unreadCount: message.isRead || message.senderId === user?.id ? 0 : 1,
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

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [displayedMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      courseId: selectedChat.courseId,
      senderId: user?.id || "",
      recipientId: selectedChat.studentId,
      message: newMessage,
    };

    // Optimistic update
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
      // Replace temp message with server version
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
      updateChatPreviews(tempMessage); // Revert preview
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {chatPreviews.map((chat) => (
              <div
                key={`${chat.studentId}-${chat.courseId}`}
                onClick={() => handleSelectChat(chat)}
                className={`flex items-center p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedChat?.studentId === chat.studentId &&
                  selectedChat?.courseId === chat.courseId
                    ? "bg-gray-100"
                    : ""
                }`}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage
                    src={`/placeholder-avatar.jpg`}
                    alt={chat.studentName}
                  />
                  <AvatarFallback>{chat.studentName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">{`${chat.studentName} - ${chat.courseTitle}`}</span>
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedChat
              ? `Chat with ${selectedChat.studentName} - ${selectedChat.courseTitle}`
              : "Select a chat"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100vh-16rem)] p-0">
          {selectedChat ? (
            <>
              <ScrollArea ref={scrollAreaRef} className="flex-1 h-0 p-4">
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
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.senderId === user?.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {msg.message}
                        <div className="text-xs mt-1 opacity-75">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex-shrink-0 p-4 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a student and course to start chatting
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
