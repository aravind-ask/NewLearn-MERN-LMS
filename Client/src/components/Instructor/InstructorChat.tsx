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
  useEditMessageMutation,
  useDeleteMessageMutation,
} from "@/redux/services/chatApi";
import { addMessage } from "@/redux/slices/chatSlice";
import { Eye, Paperclip, X, Edit, Trash, Smile } from "lucide-react";
import { useGetPresignedUrlMutation } from "@/redux/services/authApi";
import EmojiPicker from "emoji-picker-react";

interface ChatPreview {
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
}

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
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const { data: conversationData, refetch } =
    useGetAllInstructorConversationsQuery(
      { trainerId: user?.id || "" },
      { skip: !user }
    );
  const [sendMessage] = useSendMessageMutation();
  const [markMessageAsRead] = useMarkMessageAsReadMutation();
  const [editMessage] = useEditMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();

  const scrollToBottom = useCallback(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollContainer)
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }, []);

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
      socket.emit("joinInstructorRoom", { instructorId: user?.id });
      chatPreviews.forEach((preview) =>
        socket.emit("joinChatRoom", {
          courseId: preview.courseId,
          userId: preview.studentId,
        })
      );
    };

    const onNewMessage = (message: Message) => {
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

    const onMessageEdited = (updatedMessage: Message) => {
      if (
        selectedChat &&
        updatedMessage.courseId === selectedChat.courseId &&
        (updatedMessage.senderId === user?.id ||
          updatedMessage.recipientId === user?.id)
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

    const onMessageDeleted = (deletedMessage: Message) => {
      if (
        selectedChat &&
        deletedMessage.courseId === selectedChat.courseId &&
        (deletedMessage.senderId === user?.id ||
          deletedMessage.recipientId === user?.id)
      ) {
        setDisplayedMessages((prev) =>
          prev.map((msg) =>
            msg._id === deletedMessage._id ? deletedMessage : msg
          )
        );
        updateChatPreviews(deletedMessage);
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
  }, [user?.id, chatPreviews, selectedChat, dispatch, scrollToBottom]);

  useEffect(() => {
    if (!conversationData?.data) return;
    const enrichedMessages = conversationData.data.map((msg: any) => ({
      _id: msg._id,
      courseId: msg.courseId._id,
      senderId: msg.senderId._id,
      recipientId: msg.recipientId._id,
      message: msg.message,
      mediaUrl: msg.mediaUrl,
      timestamp: msg.timestamp,
      isRead: msg.isRead,
      isDeleted: msg.isDeleted || false,
      isEdited: msg.isEdited || false,
      courseTitle: msg.courseId.title,
      senderName: msg.senderId.name,
    }));
    dispatch({ type: "chat/setMessages", payload: enrichedMessages });

    const previewMap = new Map<string, ChatPreview>();
    enrichedMessages.forEach((msg: Message) => {
      const studentId =
        msg.senderId !== user?.id ? msg.senderId : msg.recipientId;
      const key = `${studentId}-${msg.courseId}`;
      const studentName =
        msg.senderId === user?.id
          ? msg.recipientId.name
          : msg.senderName || "Unknown Student";
      if (!previewMap.has(key)) {
        previewMap.set(key, {
          courseId: msg.courseId,
          courseTitle: msg.courseTitle || "Unknown Course",
          studentId,
          studentName,
          lastMessage: msg.isDeleted ? "This message was deleted" : msg.message,
          lastMessageTimestamp: msg.timestamp,
          unreadCount: msg.isRead || msg.senderId === user?.id ? 0 : 1,
        });
      } else {
        const preview = previewMap.get(key)!;
        if (new Date(msg.timestamp) > new Date(preview.lastMessageTimestamp)) {
          preview.lastMessage = msg.isDeleted
            ? "This message was deleted"
            : msg.message;
          preview.lastMessageTimestamp = msg.timestamp;
        }
        if (!msg.isRead && msg.senderId !== user?.id) preview.unreadCount += 1;
      }
    });

    const sortedPreviews = Array.from(previewMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessageTimestamp).getTime() -
        new Date(a.lastMessageTimestamp).getTime()
    );
    setChatPreviews(sortedPreviews);
  }, [conversationData, user?.id, dispatch]);

  useEffect(() => {
    if (!selectedChat) return;
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
  }, [
    displayedMessages,
    selectedChat,
    user?.id,
    markMessageAsRead,
    scrollToBottom,
  ]);

  const updateChatPreviews = (message: Message) => {
    setChatPreviews((prev) => {
      const studentId =
        message.senderId !== user?.id ? message.senderId : message.recipientId;
      const key = `${studentId}-${message.courseId}`;
      const existing = prev.find(
        (chat) => `${chat.studentId}-${chat.courseId}` === key
      );

      if (existing) {
        const updatedPreview = {
          ...existing,
          lastMessage: message.isDeleted
            ? "This message was deleted"
            : message.message,
          lastMessageTimestamp: message.timestamp,
          unreadCount:
            message.isRead || message.senderId === user?.id
              ? existing.unreadCount
              : existing.unreadCount + 1,
        };
        const updatedPreviews = prev.filter((chat) => chat !== existing);
        updatedPreviews.unshift(updatedPreview);
        return updatedPreviews;
      }

      const newPreview = {
        courseId: message.courseId,
        courseTitle: message.courseTitle || "Unknown Course",
        studentId,
        studentName: message.senderName || "Unknown Student",
        lastMessage: message.isDeleted
          ? "This message was deleted"
          : message.message,
        lastMessageTimestamp: message.timestamp,
        unreadCount: message.isRead || message.senderId === user?.id ? 0 : 1,
      };
      return [newPreview, ...prev];
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
    if (!selectedChat || (!newMessage.trim() && !file && !editingMessageId))
      return;

    if (editingMessageId) {
      try {
        const updatedMessage = await editMessage({
          messageId: editingMessageId,
          message: newMessage,
          mediaUrl: displayedMessages.find(
            (msg) => msg._id === editingMessageId
          )?.mediaUrl,
        }).unwrap();
        const enrichedMessage = {
          ...updatedMessage.data,
          courseTitle: selectedChat?.courseTitle,
          senderName: user?.name,
          role: "instructor",
        };
        setDisplayedMessages((prev) =>
          prev.map((msg) =>
            msg._id === editingMessageId ? enrichedMessage : msg
          )
        );
        socket.emit("editMessage", enrichedMessage);
        setEditingMessageId(null);
        setNewMessage("");
        refetch();
      } catch (error) {
        console.error("Failed to edit message:", error);
      }
      return;
    }

    let mediaUrl: string | undefined;
    if (file) {
      mediaUrl = await uploadMedia(file);
    }

    const messageData = {
      courseId: selectedChat.courseId,
      senderId: user?.id || "",
      recipientId: selectedChat.studentId,
      message: newMessage || (file ? "" : ""),
      mediaUrl,
    };
    const tempMessage: Message = {
      ...messageData,
      _id: `temp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      isDeleted: false,
      isEdited: false,
      courseTitle: selectedChat.courseTitle,
      senderName: user?.name,
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
        senderName: user?.name,
        role: "instructor",
      };
      socket.emit("sendMessage", enrichedMessage);
      setDisplayedMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? enrichedMessage : msg))
      );
      setNewMessage("");
      clearFile();
      refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
      setDisplayedMessages((prev) =>
        prev.filter((msg) => msg._id !== tempMessage._id)
      );
      updateChatPreviews(tempMessage);
    }
  };

  const handleEditMessage = (msg: Message) => {
    setEditingMessageId(msg._id);
    setNewMessage(msg.message);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setNewMessage("");
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
      setDisplayedMessages((prev) =>
        prev.map((msg) =>
          msg._id === showDeleteModal ? deletedMessage.data : msg
        )
      );
      socket.emit("deleteMessage", deletedMessage.data);
      refetch();
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setShowDeleteModal(null);
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
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
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4 bg-gray-100">
      {/* Chat List */}
      <Card className="w-1/3 shadow-md rounded-xl border border-gray-200 overflow-hidden">
        <CardHeader className="bg-white border-b py-3">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100vh-8rem)]">
          <ScrollArea className="h-full">
            {chatPreviews.map((chat) => (
              <div
                key={`${chat.studentId}-${chat.courseId}`}
                onClick={() => handleSelectChat(chat)}
                className={`flex items-center p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
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
                  <AvatarFallback className="bg-gray-300 text-gray-700">
                    {chat.studentName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800 truncate">
                      {chat.studentName}
                    </span>
                    {chat.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.courseTitle}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 shadow-md rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        <CardHeader className="bg-white border-b py-3 flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800">
            {selectedChat
              ? `${selectedChat.studentName} - ${selectedChat.courseTitle}`
              : "Select a Chat"}
          </CardTitle>
        </CardHeader>
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedChat ? (
            <>
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-white">
                <div className="space-y-3">
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
                <div className="flex gap-2 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    ref={emojiButtonRef}
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                  >
                    <Smile className="h-5 w-5 text-gray-500" />
                  </Button>
                  <div className="relative flex-1">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={
                        editingMessageId
                          ? "Edit your message..."
                          : "Type a message..."
                      }
                      className="w-full border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 pr-10"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
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
                    disabled={!newMessage.trim() && !file && !editingMessageId}
                    className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {editingMessageId ? "Save" : "Send"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-white">
              Select a chat to start messaging
            </div>
          )}
          {/* Emoji Picker Overlay */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
      </Card>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 z-50 flex items-center justify-center">
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
    </div>
  );
}
