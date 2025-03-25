import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetConversationQuery,
  useSendMessageMutation,
  useMarkMessageAsReadMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
} from "@/redux/services/chatApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import { addMessage, setMessages } from "@/redux/slices/chatSlice";
import { Eye, Paperclip, X, Edit, Trash, Smile } from "lucide-react";
import { useGetPresignedUrlMutation } from "@/redux/services/authApi";
import EmojiPicker from "emoji-picker-react";

interface Message {
  _id: string;
  courseId: string;
  senderId: string;
  recipientId: string;
  message: string;
  mediaUrl?: string;
  timestamp: string;
  isRead: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  courseTitle?: string;
  senderName?: string;
  role?: "student" | "instructor";
}

export default function ChatWithTrainer({
  courseId,
  trainerId,
  courseTitle,
}: {
  courseId: string;
  trainerId: string;
  courseTitle: string;
}) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { messages } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTrainerOnline, setIsTrainerOnline] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const { data: conversation, refetch } = useGetConversationQuery({
    courseId,
    trainerId,
  });
  const [sendMessage] = useSendMessageMutation();
  const [markMessageAsRead] = useMarkMessageAsReadMutation();
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => {
    const onConnect = () => {
      console.log("Socket connected, joining rooms...");
      socket.emit("joinChatRoom", { courseId, userId: user?.id });
      socket.emit("joinUser", { userId: user?.id });
    };

    const onOnlineUsers = (users: string[]) => {
      console.log("Online users received:", users);
      setIsTrainerOnline(users.includes(trainerId));
    };

    const onNewMessage = (newMessage: Message) => {
      if (
        newMessage.courseId === courseId &&
        ((newMessage.senderId === user?.id &&
          newMessage.recipientId === trainerId) ||
          (newMessage.senderId === trainerId &&
            newMessage.recipientId === user?.id))
      ) {
        dispatch(addMessage(newMessage));
      }
    };

    const onMessageEdited = (updatedMessage: Message) => {
      if (
        updatedMessage.courseId === courseId &&
        (updatedMessage.senderId === user?.id ||
          updatedMessage.recipientId === user?.id)
      ) {
        dispatch(addMessage(updatedMessage));
      }
    };

    const onMessageDeleted = (deletedMessage: Message) => {
      if (
        deletedMessage.courseId === courseId &&
        (deletedMessage.senderId === user?.id ||
          deletedMessage.recipientId === user?.id)
      ) {
        dispatch(addMessage(deletedMessage));
      }
    };

    socket.on("connect", onConnect);
    socket.on("onlineUsers", onOnlineUsers);
    socket.on("newMessage", onNewMessage);
    socket.on("messageEdited", onMessageEdited);
    socket.on("messageDeleted", onMessageDeleted);

    if (!socket.connected) {
      console.log("Socket not connected, connecting...");
      socket.connect();
    } else {
      onConnect();
    }

    return () => {
      console.log("Unmounting ChatWithTrainer, leaving user...");
      socket.emit("leaveUser", { userId: user?.id });
      socket.off("connect", onConnect);
      socket.off("onlineUsers", onOnlineUsers);
      socket.off("newMessage", onNewMessage);
      socket.off("messageEdited", onMessageEdited);
      socket.off("messageDeleted", onMessageDeleted);
    };
  }, [courseId, trainerId, user?.id, dispatch]);

  useEffect(() => {
    if (conversation) {
      dispatch(setMessages(conversation.data));
      conversation.data.forEach((msg: any) => {
        if (
          msg.recipientId === user?.id &&
          !msg.isRead &&
          msg.senderId === trainerId
        ) {
          markMessageAsRead(msg._id).catch((error) =>
            console.error("Failed to mark message as read:", error)
          );
        }
      });
    }
  }, [conversation, dispatch, user?.id, trainerId, markMessageAsRead]);

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollContainer)
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadMedia = async (file: File): Promise<string> => {
    const { url } = await getPresignedUrl({ fileName: file.name }).unwrap();
    await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    return url.split("?")[0];
  };

  const handleSendMessage = async () => {
    if (
      !courseId ||
      !trainerId ||
      (!message.trim() && !file && !editingMessageId)
    )
      return;

    if (editingMessageId) {
      try {
        const updatedMessage = await editMessage({
          messageId: editingMessageId,
          message: message,
          mediaUrl: messages.find((msg) => msg._id === editingMessageId)
            ?.mediaUrl,
        }).unwrap();
        const enrichedMessage = {
          ...updatedMessage.data,
          courseTitle,
          senderName: user?.name,
          role: "student",
        };
        dispatch(addMessage(enrichedMessage));
        socket.emit("editMessage", enrichedMessage);
        setEditingMessageId(null);
        setMessage("");
        refetch();
      } catch (error) {
        console.error("Failed to edit message:", error);
      }
      return;
    }

    let mediaUrl: string | undefined;
    if (file) mediaUrl = await uploadMedia(file);

    const messageData = {
      courseId,
      senderId: user?.id,
      recipientId: trainerId,
      message: message || (file ? "" : ""),
      mediaUrl,
    };
    const tempMessage: Message = {
      ...messageData,
      _id: `temp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      isDeleted: false,
      isEdited: false,
      courseTitle,
      senderName: user?.name,
      role: "student",
    };
    dispatch(addMessage(tempMessage));

    try {
      const savedMessage = await sendMessage(messageData).unwrap();
      const enrichedMessage = {
        ...savedMessage.data,
        courseTitle,
        senderName: user?.name,
        role: "student",
      };
      socket.emit("sendMessage", enrichedMessage);
      dispatch(addMessage(enrichedMessage));
      setMessage("");
      clearFile();
      refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
      dispatch({ type: "chat/removeMessage", payload: tempMessage._id });
    }
  };

  const handleEditMessage = (msg: Message) => {
    setEditingMessageId(msg._id);
    setMessage(msg.message);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setMessage("");
  };

  const handleDeleteMessage = async (messageId: string) => {
    setShowDeleteModal(messageId);
  };

  const confirmDelete = async () => {
    if (!showDeleteModal) return;
    try {
      const deletedMessage = await deleteMessage({
        messageId: showDeleteModal,
      }).unwrap();
      dispatch(addMessage(deletedMessage.data));
      socket.emit("deleteMessage", deletedMessage.data);
      refetch();
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setShowDeleteModal(null);
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const renderMessageContent = (msg: Message) => (
    <div className="relative group">
      {msg.senderId === user?.id && !msg.isDeleted && (
        <div className="absolute -top-10 right-0 flex items-center gap-1 bg-gray-800 bg-opacity-75 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-gray-700 rounded-full"
            onClick={() => handleEditMessage(msg)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-gray-700 rounded-full"
            onClick={() => handleDeleteMessage(msg._id)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      )}
      {msg.isDeleted ? (
        <p className="text-sm italic text-gray-500">This message was deleted</p>
      ) : (
        <>
          {msg.mediaUrl &&
            (msg.mediaUrl.match(/\.(mp4|webm|ogg)$/) ? (
              <video controls className="max-w-xs rounded-lg">
                <source
                  src={msg.mediaUrl}
                  type={`video/${msg.mediaUrl.split(".").pop()}`}
                />
              </video>
            ) : (
              <img
                src={msg.mediaUrl}
                alt="Chat media"
                className="max-w-xs rounded-lg"
              />
            ))}
          {msg.message && (
            <p className="text-sm whitespace-pre-wrap">
              {msg.message}
              {msg.isEdited && (
                <span className="text-xs text-gray-400 ml-2">(Edited)</span>
              )}
            </p>
          )}
        </>
      )}
    </div>
  );

  return (
    <Card className="flex flex-col h-[600px] shadow-md rounded-xl border border-gray-200 overflow-hidden">
      <CardHeader className="bg-white border-b py-3">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          Chat with Trainer - {courseTitle}
          <span
            className={`h-3 w-3 rounded-full ${
              isTrainerOnline ? "bg-green-500" : "bg-gray-300"
            }`}
            title={isTrainerOnline ? "Online" : "Offline"}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-white">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.senderId === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                    msg.senderId === user?.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {renderMessageContent(msg)}
                  <div className="flex items-center justify-end mt-1 text-xs text-gray-400">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.senderId === user?.id &&
                      msg.isRead &&
                      !msg.isDeleted && (
                        <Eye className="w-3 h-3 ml-1 text-gray-300" />
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-3 shrink-0">
          {previewUrl && (
            <div className="relative max-w-[200px]">
              {file?.type.startsWith("video") ? (
                <video controls className="max-w-full h-auto rounded-lg">
                  <source src={previewUrl} type={file.type} />
                </video>
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg"
                />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex gap-2 items-center relative">
            <Button
              variant="ghost"
              size="icon"
              ref={emojiButtonRef}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            >
              <Smile className="h-5 w-5 text-gray-500" />
            </Button>
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute z-60 bottom-full mb-2 left-0"
                style={{ width: "300px" }}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <div className="relative flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  editingMessageId
                    ? "Edit your message..."
                    : "Type a message..."
                }
                className="w-full border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 pr-10"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              {editingMessageId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-500 hover:text-gray-700"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Input
              type="file"
              accept="image/*,video/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              size="icon"
            >
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() && !file && !editingMessageId}
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {editingMessageId ? "Save" : "Send"}
            </Button>
          </div>
        </div>
      </CardContent>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800">
              Delete Message
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete this message?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
