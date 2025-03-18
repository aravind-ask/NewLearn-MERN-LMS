// src/components/ChatWithTrainer.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetConversationQuery,
  useSendMessageMutation,
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

    const onDisconnect = () => {
      console.log("Student disconnected from socket");
      dispatch(setConnected(false));
    };

    socket.on("connect", onConnect);
    socket.on("newMessage", onNewMessage);
    socket.on("disconnect", onDisconnect);

    // Ensure connection and join room on mount
    if (!socket.connected) {
      console.log("Socket not connected, attempting to connect...");
      socket.connect();
    } else {
      onConnect(); // Join room immediately if already connected
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("newMessage", onNewMessage);
      socket.off("disconnect", onDisconnect);
    };
  }, [courseId, trainerId, user?.id, dispatch]);

  useEffect(() => {
    if (conversation) {
      dispatch(setMessages(conversation.data));
    }
  }, [conversation, dispatch]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
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
      setMessage("");
      refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Chat with Trainer</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.senderId === user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.senderId === user.id
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
        <div className="flex-shrink-0 p-4 flex gap-2 border-t">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
}
