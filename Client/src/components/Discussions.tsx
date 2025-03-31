import { useEffect, useState, useRef, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { socket } from "@/lib/socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Picker from "emoji-picker-react";
import {
  useGetDiscussionsByLectureQuery,
  useCreateDiscussionMutation,
  useGetDiscussionByIdQuery,
  useCreateCommentMutation,
  useEditDiscussionMutation,
  useDeleteDiscussionMutation,
  useEditCommentMutation,
  useDeleteCommentMutation,
} from "@/redux/services/discussionApi";
import {
  setDiscussions,
  addDiscussion,
  setCurrentDiscussion,
  addComment,
  editDiscussion,
  deleteDiscussion,
  editComment,
  deleteComment,
} from "@/redux/slices/discussionSlice";
import { MessageCircle, Edit, Trash2, Paperclip, X, Smile } from "lucide-react";
import { useGetPresignedUrlMutation } from "@/redux/services/authApi";

interface Comment {
  _id: string;
  discussionId: string;
  userId: { _id: string; name: string };
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

interface Discussion {
  _id: string;
  lectureId: string;
  userId: { _id: string; name: string };
  topic: string;
  mediaUrl?: string;
  createdAt: string;
  commentsCount: number;
}

const CommentItem = memo(
  ({
    comment,
    userId,
    onEdit,
    onDelete,
  }: {
    comment: Comment;
    userId?: string;
    onEdit: (id: string, content: string) => void;
    onDelete: (id: string) => void;
  }) => (
    <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors duration-200 flex justify-between items-start">
      <div>
        {comment.mediaUrl &&
          (comment.mediaUrl.match(/\.(mp4|webm|ogg)$/) ? (
            <video controls className="max-w-xs rounded-lg mb-2">
              <source
                src={comment.mediaUrl}
                type={`video/${comment.mediaUrl.split(".").pop()}`}
              />
            </video>
          ) : (
            <img
              src={comment.mediaUrl}
              alt="Comment media"
              className="max-w-xs rounded-lg mb-2"
            />
          ))}
        <p className="text-sm text-gray-800">{comment.content}</p>
        <div className="text-xs text-gray-500 mt-1">
          {comment.userId.name} •{" "}
          {new Date(comment.createdAt).toLocaleString([], {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </div>
      </div>
      {comment.userId._id === userId && (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(comment._id, comment.content)}
            className="text-gray-600 hover:text-teal-500"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(comment._id)}
            className="text-gray-600 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
);

const DiscussionItem = memo(
  ({
    discussion,
    userId,
    expandedDiscussionId,
    onToggleThread,
    onEdit,
    onDelete,
    comments,
    commentInput,
    onCommentChange,
    onCreateComment,
    scrollAreaRef,
    commentFiles,
    commentPreviews,
    handleCommentFileChange,
    clearCommentFile,
  }: {
    discussion: Discussion;
    userId?: string;
    expandedDiscussionId: string | null;
    onToggleThread: (id: string) => void;
    onEdit: (
      id: string,
      content: string,
      type: "discussion" | "comment"
    ) => void;
    onDelete: (id: string, type: "discussion" | "comment") => void;
    comments: Comment[];
    commentInput: string;
    onCommentChange: (id: string, value: string) => void;
    onCreateComment: (id: string) => void;
    scrollAreaRef: (el: HTMLDivElement | null) => void;
    commentFiles: { [key: string]: File | null };
    commentPreviews: { [key: string]: string | null };
    handleCommentFileChange: (
      discussionId: string,
      e: React.ChangeEvent<HTMLInputElement>
    ) => void;
    clearCommentFile: (discussionId: string) => void;
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const onEmojiClick = (emojiObject: { emoji: string }) => {
      onCommentChange(discussion._id, commentInput + emojiObject.emoji);
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target as Node)
        ) {
          setShowEmojiPicker(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <AccordionItem
        key={discussion._id}
        value={discussion._id}
        className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <AccordionTrigger
          onClick={() => onToggleThread(discussion._id)}
          className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-gray-800"
        >
          <div className="flex-1 text-left">
            <div className="font-semibold text-lg">{discussion.topic}</div>
            {discussion.mediaUrl &&
              (discussion.mediaUrl.match(/\.(mp4|webm|ogg)$/) ? (
                <video controls className="max-w-xs rounded-lg mt-2">
                  <source
                    src={discussion.mediaUrl}
                    type={`video/${discussion.mediaUrl.split(".").pop()}`}
                  />
                </video>
              ) : (
                <img
                  src={discussion.mediaUrl}
                  alt="Discussion media"
                  className="max-w-xs rounded-lg mt-2"
                />
              ))}
            <div className="text-sm text-gray-600 mt-1">
              Started by {discussion.userId.name} • {discussion.commentsCount}{" "}
              comments •{" "}
              {new Date(discussion.createdAt).toLocaleString([], {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {discussion.userId._id === userId && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(discussion._id, discussion.topic, "discussion");
                  }}
                  className="text-gray-600 hover:text-teal-500"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(discussion._id, "discussion");
                  }}
                  className="text-gray-600 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-4 bg-white">
          {expandedDiscussionId === discussion._id && (
            <div className="flex flex-col gap-4">
              <ScrollArea
                ref={scrollAreaRef}
                className="h-[400px] p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center italic">
                      No comments yet.
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <CommentItem
                        key={comment._id}
                        comment={comment}
                        userId={userId}
                        onEdit={onEdit}
                        onDelete={(id) => onDelete(id, "comment")}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="flex flex-col gap-3 relative">
                {commentPreviews[discussion._id] && (
                  <div className="relative max-w-[200px]">
                    {commentFiles[discussion._id]?.type.startsWith("video") ? (
                      <video controls className="max-w-full h-auto rounded-lg">
                        <source
                          src={commentPreviews[discussion._id]}
                          type={commentFiles[discussion._id]?.type}
                        />
                      </video>
                    ) : (
                      <img
                        src={commentPreviews[discussion._id]}
                        alt="Preview"
                        className="max-w-full h-auto rounded-lg"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1"
                      onClick={() => clearCommentFile(discussion._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Input
                    value={commentInput}
                    onChange={(e) =>
                      onCommentChange(discussion._id, e.target.value)
                    }
                    placeholder="Add a comment..."
                    className="rounded-full border-gray-300 shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-gray-800 placeholder-gray-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" && onCreateComment(discussion._id)
                    }
                  />

                  <Input
                    type="file"
                    accept="image/*,video/*"
                    ref={fileInputRef}
                    onChange={(e) => handleCommentFileChange(discussion._id, e)}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-5 w-5 text-gray-500" />
                  </Button>
                  <Button
                    onClick={() => onCreateComment(discussion._id)}
                    className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-md transition-all duration-300"
                  >
                    Comment
                  </Button>
                </div>
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-12 left-0 z-50"
                  >
                    <Picker onEmojiClick={onEmojiClick} />
                  </div>
                )}
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    );
  }
);

export default function Discussions({ lectureId }: { lectureId: string }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { discussions, currentDiscussion } = useSelector(
    (state: RootState) => state.discussion
  );
  const dispatch = useDispatch();

  // Local state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [expandedDiscussionId, setExpandedDiscussionId] = useState<
    string | null
  >(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );
  const [editingDiscussion, setEditingDiscussion] = useState<{
    id: string;
    topic: string;
    mediaUrl?: string;
  } | null>(null);
  const [editingComment, setEditingComment] = useState<{
    id: string;
    content: string;
    mediaUrl?: string;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    type: "discussion" | "comment";
    id: string;
  } | null>(null);
  const [commentFiles, setCommentFiles] = useState<{
    [key: string]: File | null;
  }>({});
  const [commentPreviews, setCommentPreviews] = useState<{
    [key: string]: string | null;
  }>({});
  const [showTopicEmojiPicker, setShowTopicEmojiPicker] = useState(false);
  const topicEmojiPickerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const discussionsScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RTK Query hooks
  const { data: discussionData, refetch: refetchDiscussions } =
    useGetDiscussionsByLectureQuery(lectureId);
  const { data: currentDiscussionData, refetch: refetchThread } =
    useGetDiscussionByIdQuery(expandedDiscussionId || "", {
      skip: !expandedDiscussionId,
    });
  const [createDiscussion] = useCreateDiscussionMutation();
  const [createComment] = useCreateCommentMutation();
  const [editDiscussionMutation] = useEditDiscussionMutation();
  const [deleteDiscussionMutation] = useDeleteDiscussionMutation();
  const [editCommentMutation] = useEditCommentMutation();
  const [deleteCommentMutation] = useDeleteCommentMutation();
  const [getPresignedUrl] = useGetPresignedUrlMutation();

  const uploadMedia = async (file: File): Promise<string> => {
    try {
      const { url } = await getPresignedUrl({ fileName: file.name }).unwrap();
      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      return url.split("?")[0];
    } catch (error) {
      console.error("Failed to upload media:", error);
      throw error;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleCommentFileChange = (
    discussionId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (commentPreviews[discussionId])
        URL.revokeObjectURL(commentPreviews[discussionId]!);
      setCommentFiles((prev) => ({ ...prev, [discussionId]: selectedFile }));
      setCommentPreviews((prev) => ({
        ...prev,
        [discussionId]: URL.createObjectURL(selectedFile),
      }));
    }
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearCommentFile = (discussionId: string) => {
    if (commentPreviews[discussionId])
      URL.revokeObjectURL(commentPreviews[discussionId]!);
    setCommentFiles((prev) => ({ ...prev, [discussionId]: null }));
    setCommentPreviews((prev) => ({ ...prev, [discussionId]: null }));
  };

  const scrollToBottom = useCallback((discussionId: string) => {
    const scrollArea = scrollAreaRefs.current[discussionId];
    if (scrollArea) {
      const scrollContainer = scrollArea.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer)
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, []);

  const scrollDiscussionsToTop = useCallback(() => {
    const scrollContainer = discussionsScrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      console.error("Socket not connected!");
      socket.connect();
    }
    socket.emit("joinLectureRoom", { lectureId });

    const handleNewDiscussion = (newDiscussion: Discussion) => {
      if (newDiscussion.lectureId === lectureId) {
        dispatch(addDiscussion(newDiscussion));
        scrollDiscussionsToTop();
      }
    };
    const handleEditDiscussion = (updatedDiscussion: Discussion) => {
      if (updatedDiscussion.lectureId === lectureId)
        dispatch(editDiscussion(updatedDiscussion));
    };
    const handleDeleteDiscussion = ({
      discussionId,
    }: {
      discussionId: string;
    }) => dispatch(deleteDiscussion(discussionId));

    socket.on("newDiscussion", handleNewDiscussion);
    socket.on("editDiscussion", handleEditDiscussion);
    socket.on("deleteDiscussion", handleDeleteDiscussion);

    return () => {
      socket.off("newDiscussion", handleNewDiscussion);
      socket.off("editDiscussion", handleEditDiscussion);
      socket.off("deleteDiscussion", handleDeleteDiscussion);
    };
  }, [lectureId, dispatch, scrollDiscussionsToTop]);

  useEffect(() => {
    if (!expandedDiscussionId) return;
    socket.emit("joinDiscussionRoom", { discussionId: expandedDiscussionId });

    const handleNewComment = (newComment: Comment) => {
      console.log("Received new comment:", newComment);
      dispatch(addComment(newComment));
      if (newComment.discussionId === expandedDiscussionId)
        scrollToBottom(expandedDiscussionId);
    };
    const handleEditComment = (updatedComment: Comment) =>
      dispatch(editComment(updatedComment));
    const handleDeleteComment = ({ commentId }: { commentId: string }) =>
      dispatch(deleteComment(commentId));

    socket.on("newComment", handleNewComment);
    socket.on("editComment", handleEditComment);
    socket.on("deleteComment", handleDeleteComment);

    return () => {
      socket.off("newComment", handleNewComment);
      socket.off("editComment", handleEditComment);
      socket.off("deleteComment", handleDeleteComment);
    };
  }, [expandedDiscussionId, dispatch, scrollToBottom]);

  useEffect(() => {
    if (discussionData?.data) dispatch(setDiscussions(discussionData.data));
  }, [discussionData, dispatch]);

  useEffect(() => {
    if (currentDiscussionData?.data) {
      dispatch(setCurrentDiscussion(currentDiscussionData.data));
      if (expandedDiscussionId) scrollToBottom(expandedDiscussionId);
    }
  }, [currentDiscussionData, dispatch, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      Object.values(commentPreviews).forEach(
        (url) => url && URL.revokeObjectURL(url)
      );
    };
  }, [previewUrl, commentPreviews]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        topicEmojiPickerRef.current &&
        !topicEmojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowTopicEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCreateDiscussion = async () => {
    if (!user?.id || (!topic.trim() && !file)) return;
    try {
      let mediaUrl: string | undefined;
      if (file) mediaUrl = await uploadMedia(file);
      await createDiscussion({ lectureId, topic, mediaUrl }).unwrap();
      setTopic("");
      clearFile();
      refetchDiscussions();
    } catch (error) {
      console.error("Failed to create discussion:", error);
    }
  };

  const handleCreateComment = async (discussionId: string) => {
    if (!user?.id) return;
    const content = commentInputs[discussionId]?.trim();
    const file = commentFiles[discussionId];
    if (!content && !file) return;
    try {
      let mediaUrl: string | undefined;
      if (file) mediaUrl = await uploadMedia(file);
      await createComment({
        discussionId,
        content: content || "",
        mediaUrl,
      }).unwrap();
      setCommentInputs((prev) => ({ ...prev, [discussionId]: "" }));
      clearCommentFile(discussionId);
      refetchThread();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleEdit = (
    id: string,
    content: string,
    type: "discussion" | "comment" = "comment"
  ) => {
    if (type === "discussion") {
      const discussion = discussions.find((d) => d._id === id);
      setEditingDiscussion({
        id,
        topic: content,
        mediaUrl: discussion?.mediaUrl,
      });
    } else {
      const comment = currentDiscussion?.comments.find((c) => c._id === id);
      setEditingComment({ id, content, mediaUrl: comment?.mediaUrl });
    }
  };

  const handleDelete = (id: string, type: "discussion" | "comment") => {
    setDeleteDialog({ type, id });
  };

  const handleSaveEdit = async () => {
    if (!user?.id) return;
    try {
      if (editingDiscussion) {
        let mediaUrl = editingDiscussion.mediaUrl;
        if (file) mediaUrl = await uploadMedia(file);
        await editDiscussionMutation({
          discussionId: editingDiscussion.id,
          topic: editingDiscussion.topic,
          mediaUrl,
        }).unwrap();
        setEditingDiscussion(null);
        clearFile();
        refetchDiscussions();
      } else if (editingComment && currentDiscussion?._id) {
        let mediaUrl = editingComment.mediaUrl;
        if (commentFiles[currentDiscussion._id])
          mediaUrl = await uploadMedia(commentFiles[currentDiscussion._id]!);
        await editCommentMutation({
          commentId: editingComment.id,
          content: editingComment.content,
          mediaUrl,
        }).unwrap();
        setEditingComment(null);
        clearCommentFile(currentDiscussion._id);
        refetchThread();
      }
    } catch (error) {
      console.error(
        `Failed to edit ${editingDiscussion ? "discussion" : "comment"}:`,
        error
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog || !user?.id) return;
    try {
      if (deleteDialog.type === "discussion") {
        await deleteDiscussionMutation(deleteDialog.id).unwrap();
        refetchDiscussions();
      } else {
        await deleteCommentMutation(deleteDialog.id).unwrap();
        refetchThread();
      }
      setDeleteDialog(null);
    } catch (error) {
      console.error(`Failed to delete ${deleteDialog.type}:`, error);
    }
  };

  const handleCommentChange = (discussionId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [discussionId]: value }));
  };

  const onTopicEmojiClick = (emojiObject: { emoji: string }) => {
    setTopic(topic + emojiObject.emoji);
    // Do not close the picker here to allow multiple selections
  };

  const getCommentsForDiscussion = (discussionId: string) =>
    expandedDiscussionId === discussionId &&
    currentDiscussion?._id === discussionId
      ? currentDiscussion.comments
      : discussions.find((d) => d._id === discussionId)?.comments || [];

  return (
    <Card className="shadow-xl rounded-xl border border-gray-200 bg-white h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6 flex-shrink-0">
        <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-teal-500" />
          Lecture Discussions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex flex-col gap-3 flex-shrink-0 relative">
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
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTopicEmojiPicker(!showTopicEmojiPicker)}
            >
              <Smile className="h-5 w-5 text-gray-500" />
            </Button>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Start a new discussion..."
              className="rounded-full border-gray-300 shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-gray-800 placeholder-gray-500"
              onKeyPress={(e) => e.key === "Enter" && handleCreateDiscussion()}
            />

            <Input
              type="file"
              accept="image/*,video/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
            <Button
              onClick={handleCreateDiscussion}
              className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-md transition-all duration-300"
            >
              Post
            </Button>
          </div>
          {showTopicEmojiPicker && (
            <div
              ref={topicEmojiPickerRef}
              className="absolute top-14 left-0 z-50"
            >
              <Picker onEmojiClick={onTopicEmojiClick} />
            </div>
          )}
        </div>
        <ScrollArea
          ref={discussionsScrollRef}
          className="flex-1 bg-gray-50 rounded-lg border border-gray-200"
        >
          <Accordion type="single" collapsible className="space-y-4 p-4">
            {discussions.length === 0 ? (
              <p className="text-gray-500 text-center italic">
                No discussions yet. Start one above!
              </p>
            ) : (
              discussions.map((discussion) => (
                <DiscussionItem
                  key={discussion._id}
                  discussion={discussion}
                  userId={user?.id}
                  expandedDiscussionId={expandedDiscussionId}
                  onToggleThread={setExpandedDiscussionId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  comments={getCommentsForDiscussion(discussion._id)}
                  commentInput={commentInputs[discussion._id] || ""}
                  onCommentChange={handleCommentChange}
                  onCreateComment={handleCreateComment}
                  scrollAreaRef={(el) =>
                    (scrollAreaRefs.current[discussion._id] = el)
                  }
                  commentFiles={commentFiles}
                  commentPreviews={commentPreviews}
                  handleCommentFileChange={handleCommentFileChange}
                  clearCommentFile={clearCommentFile}
                />
              ))
            )}
          </Accordion>
        </ScrollArea>
      </CardContent>

      <Dialog
        open={!!(editingDiscussion || editingComment)}
        onOpenChange={() => {
          setEditingDiscussion(null);
          setEditingComment(null);
          clearFile();
          if (currentDiscussion?._id) clearCommentFile(currentDiscussion._id);
        }}
      >
        <DialogContent className="sm:max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDiscussion ? "Edit Discussion" : "Edit Comment"}
            </DialogTitle>
          </DialogHeader>
          {(editingDiscussion && previewUrl) ||
          (editingComment &&
            currentDiscussion?._id &&
            commentPreviews[currentDiscussion._id]) ? (
            <div className="relative max-w-[200px] mb-4">
              {file?.type.startsWith("video") ||
              (currentDiscussion?._id &&
                commentFiles[currentDiscussion._id]?.type.startsWith(
                  "video"
                )) ? (
                <video controls className="max-w-full h-auto rounded-lg">
                  <source
                    src={
                      editingDiscussion
                        ? previewUrl
                        : commentPreviews[currentDiscussion!._id]
                    }
                    type={
                      file?.type ||
                      (currentDiscussion?._id &&
                        commentFiles[currentDiscussion._id]?.type)
                    }
                  />
                </video>
              ) : (
                <img
                  src={
                    editingDiscussion
                      ? previewUrl
                      : commentPreviews[currentDiscussion!._id]
                  }
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg"
                />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1"
                onClick={() =>
                  editingDiscussion
                    ? clearFile()
                    : currentDiscussion?._id &&
                      clearCommentFile(currentDiscussion._id)
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
          <Input
            value={editingDiscussion?.topic || editingComment?.content || ""}
            onChange={(e) =>
              editingDiscussion
                ? setEditingDiscussion({
                    ...editingDiscussion,
                    topic: e.target.value,
                  })
                : setEditingComment({
                    ...editingComment!,
                    content: e.target.value,
                  })
            }
            className="border-gray-300 focus:ring-2 focus:ring-teal-500"
          />
          <Input
            type="file"
            accept="image/*,video/*"
            onChange={(e) =>
              editingDiscussion
                ? handleFileChange(e)
                : currentDiscussion?._id &&
                  handleCommentFileChange(currentDiscussion._id, e)
            }
            className="mt-2"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingDiscussion(null);
                setEditingComment(null);
                clearFile();
                if (currentDiscussion?._id)
                  clearCommentFile(currentDiscussion._id);
              }}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteDialog?.type}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(null)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
