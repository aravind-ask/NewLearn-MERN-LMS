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

export default function ChatWithTrainer({ courseId, trainerId, courseTitle }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { messages } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null); // Ref for EmojiPicker

  const { data: conversation, refetch } = useGetConversationQuery({
    courseId,
    trainerId,
  });
  const [sendMessage] = useSendMessageMutation();
  const [markMessageAsRead] = useMarkMessageAsReadMutation();
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();

  // Close emoji picker on outside click
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    const onConnect = () => {
      socket.emit("joinChatRoom", { courseId, userId: user?.id });
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
    socket.on("newMessage", onNewMessage);
    socket.on("messageEdited", onMessageEdited);
    socket.on("messageDeleted", onMessageDeleted);

    if (!socket.connected) socket.connect();
    else onConnect();

    return () => {
      socket.off("connect", onConnect);
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
    if (!courseId || !trainerId || (!message.trim() && !file)) return;

    let mediaUrl: string | undefined;
    if (file) {
      mediaUrl = await uploadMedia(file);
    }

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
    setEditedMessage(msg.message);
  };

  const handleSaveEdit = async (
    messageId: string,
    currentMediaUrl?: string
  ) => {
    if (!editedMessage.trim() && !currentMediaUrl) return;

    try {
      const updatedMessage = await editMessage({
        messageId,
        message: editedMessage,
        mediaUrl: currentMediaUrl,
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
      setEditedMessage("");
      refetch();
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const deletedMessage = await deleteMessage({ messageId }).unwrap();
      dispatch(addMessage(deletedMessage.data));
      socket.emit("deleteMessage", deletedMessage.data);
      refetch();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const renderMessageContent = (msg: Message) => (
    <div className="relative group">
      {msg.senderId === user?.id && !msg.isDeleted && (
        <div className="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditMessage(msg)}
          >
            <Edit className="w-4 h-4 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteMessage(msg._id)}
          >
            <Trash className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      )}
      {msg.isDeleted ? (
        <p className="text-sm italic text-gray-500">This message was deleted</p>
      ) : editingMessageId === msg._id ? (
        <div className="flex flex-col gap-2">
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
          <Input
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            className="w-full bg-white border-gray-300 rounded-lg"
            onKeyPress={(e) =>
              e.key === "Enter" && handleSaveEdit(msg._id, msg.mediaUrl)
            }
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleSaveEdit(msg._id, msg.mediaUrl)}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingMessageId(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
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
        <CardTitle className="text-lg font-semibold text-gray-800">
          Chat with Trainer - {courseTitle}
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
        <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-3 shrink-0 relative">
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
          <div className="flex gap-2 items-center">
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
                className="absolute z-10 bottom-full mb-2"
                style={{
                  left: emojiButtonRef.current?.getBoundingClientRect().left
                    ? `${emojiButtonRef.current.getBoundingClientRect().left}px`
                    : "0px",
                }}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
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
              disabled={!message.trim() && !file}
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
