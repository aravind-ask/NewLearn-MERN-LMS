// src/components/ChatWithTrainer.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetConversationQuery,
  useSendMessageMutation,
  useMarkMessageAsReadMutation,
} from "@/redux/services/chatApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import {
  addMessage,
  setMessages,
  setConnected,
} from "@/redux/slices/chatSlice";
import { Eye } from "lucide-react";

export default function ChatWithTrainer({ courseId, trainerId, courseTitle }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { messages } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: conversation, refetch } = useGetConversationQuery({
    courseId,
    trainerId,
  });
  const [sendMessage] = useSendMessageMutation();
  const [markMessageAsRead] = useMarkMessageAsReadMutation();

  useEffect(() => {
    const onConnect = () => {
      console.log("Student connected to socket:", socket.id);
      dispatch(setConnected(true));
      const room = `chat_${courseId}_${user.id}`;
      socket.emit("joinChatRoom", { courseId, userId: user.id });
      console.log(`Student joined room: ${room}`);
    };

    const onNewMessage = (newMessage: any) => {
      console.log("Student received newMessage:", newMessage);
      if (
        newMessage.courseId === courseId &&
        ((newMessage.senderId === user.id &&
          newMessage.recipientId === trainerId) ||
          (newMessage.senderId === trainerId &&
            newMessage.recipientId === user.id))
      ) {
        dispatch(addMessage(newMessage));
      }
    };

    const onMessageRead = (updatedMessage: any) => {
      console.log("Student received messageRead:", updatedMessage);
      dispatch(addMessage(updatedMessage));
    };

    const onDisconnect = () => {
      console.log("Student disconnected from socket");
      dispatch(setConnected(false));
    };

    socket.on("connect", onConnect);
    socket.on("newMessage", onNewMessage);
    socket.on("messageRead", onMessageRead);
    socket.on("disconnect", onDisconnect);

    if (!socket.connected) socket.connect();
    else onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("newMessage", onNewMessage);
      socket.off("messageRead", onMessageRead);
      socket.off("disconnect", onDisconnect);
    };
  }, [courseId, trainerId, user?.id, dispatch]);

  useEffect(() => {
    if (conversation) {
      dispatch(setMessages(conversation.data));
      conversation.data.forEach((msg: any) => {
        if (
          msg.recipientId === user.id &&
          !msg.isRead &&
          msg.senderId === trainerId
        ) {
          markMessageAsRead(msg._id).catch((error) =>
            console.error("Failed to mark message as read:", error)
          );
        }
      });
    }
  }, [conversation, dispatch, user.id, trainerId, markMessageAsRead]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer)
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const messageData = {
      courseId,
      senderId: user.id,
      recipientId: trainerId,
      message,
    };

    // Optimistic update with temp ID
    const tempMessage = {
      ...messageData,
      _id: `temp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      courseTitle,
      senderName: user.name,
      role: "student",
    };
    dispatch(addMessage(tempMessage));

    try {
      const savedMessage = await sendMessage(messageData).unwrap();
      const enrichedMessage = {
        ...savedMessage.data,
        courseTitle,
        senderName: user.name,
        role: "student",
      };
      console.log("Student sending savedMessage via socket:", enrichedMessage);
      socket.emit("sendMessage", enrichedMessage);
      // Replace temp message in Redux
      dispatch(addMessage(enrichedMessage));
      setMessage("");
      refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove temp message on failure
      dispatch({
        type: "chat/removeMessage",
        payload: tempMessage._id,
      });
    }
  };

  return (
    <Card className="flex flex-col h-[500px] shadow-lg rounded-xl border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Chat with Trainer - {courseTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.senderId === user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                    msg.senderId === user.id
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
                    {msg.senderId === user.id && msg.isRead && (
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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
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
      </CardContent>
    </Card>
  );
}
