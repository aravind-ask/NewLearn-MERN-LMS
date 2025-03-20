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
import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
} from "lucide-react";

// Memoized Comment Item to prevent unnecessary re-renders
const CommentItem = memo(({ comment, userId, onEdit, onDelete }) => (
  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors duration-200 flex justify-between items-start">
    <div>
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
));

// Memoized Discussion Item
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
  }) => (
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
                  onEdit(discussion._id, discussion.topic);
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
            <div className="flex gap-3">
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
              <Button
                onClick={() => onCreateComment(discussion._id)}
                className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-md transition-all duration-300"
              >
                Comment
              </Button>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
);

export default function Discussions({ lectureId }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { discussions, currentDiscussion } = useSelector(
    (state: RootState) => state.discussion
  );
  const dispatch = useDispatch();

  // Local state
  const [topic, setTopic] = useState("");
  const [expandedDiscussionId, setExpandedDiscussionId] = useState<
    string | null
  >(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );
  const [editDiscussion, setEditDiscussion] = useState<{
    id: string;
    topic: string;
  } | null>(null);
  const [editComment, setEditComment] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    type: "discussion" | "comment";
    id: string;
  } | null>(null);
  const scrollAreaRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const discussionsScrollRef = useRef<HTMLDivElement>(null);

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

  // Socket.IO listeners
  useEffect(() => {
    if (!socket.connected) {
      console.error("Socket not connected!");
      socket.connect();
    }
    socket.emit("joinLectureRoom", { lectureId });
    console.log("Joining lecture room:", `lecture_${lectureId}`);

    const handleNewDiscussion = (newDiscussion) => {
      if (newDiscussion.lectureId === lectureId) {
        dispatch(addDiscussion(newDiscussion));
        scrollDiscussionsToTop();
      }
    };
    const handleEditDiscussion = (updatedDiscussion) => {
      if (updatedDiscussion.lectureId === lectureId)
        dispatch(editDiscussion(updatedDiscussion));
    };
    const handleDeleteDiscussion = ({ discussionId }) =>
      dispatch(deleteDiscussion(discussionId));

    socket.on("newDiscussion", handleNewDiscussion);
    socket.on("editDiscussion", handleEditDiscussion);
    socket.on("deleteDiscussion", handleDeleteDiscussion);

    return () => {
      socket.off("newDiscussion", handleNewDiscussion);
      socket.off("editDiscussion", handleEditDiscussion);
      socket.off("deleteDiscussion", handleDeleteDiscussion);
    };
  }, [lectureId, dispatch]);

  useEffect(() => {
    if (!expandedDiscussionId) return;
    socket.emit("joinDiscussionRoom", { discussionId: expandedDiscussionId });
    console.log(
      "Joining discussion room:",
      `discussion_${expandedDiscussionId}`
    );

    const handleNewComment = (newComment) => {
      dispatch(addComment(newComment));
      if (newComment.discussionId === expandedDiscussionId)
        scrollToBottom(expandedDiscussionId);
    };
    const handleEditComment = (updatedComment) =>
      dispatch(editComment(updatedComment));
    const handleDeleteComment = ({ commentId }) =>
      dispatch(deleteComment(commentId));

    socket.on("newComment", handleNewComment);
    socket.on("editComment", handleEditComment);
    socket.on("deleteComment", handleDeleteComment);

    return () => {
      socket.off("newComment", handleNewComment);
      socket.off("editComment", handleEditComment);
      socket.off("deleteComment", handleDeleteComment);
    };
  }, [expandedDiscussionId, dispatch]);

  // Sync state with API data
  useEffect(() => {
    if (discussionData?.data) dispatch(setDiscussions(discussionData.data));
  }, [discussionData, dispatch]);

  useEffect(() => {
    if (currentDiscussionData?.data) {
      dispatch(setCurrentDiscussion(currentDiscussionData.data));
      scrollToBottom(expandedDiscussionId!);
    }
  }, [currentDiscussionData, dispatch]);

  // Scroll utilities
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

  // Handlers
  const handleCreateDiscussion = async () => {
    if (!topic.trim()) return;
    try {
      await createDiscussion({ lectureId, topic }).unwrap();
      setTopic("");
      refetchDiscussions();
    } catch (error) {
      console.error("Failed to create discussion:", error);
    }
  };

  const handleCreateComment = async (discussionId: string) => {
    const content = commentInputs[discussionId]?.trim();
    if (!content) return;
    try {
      await createComment({ discussionId, content }).unwrap();
      setCommentInputs((prev) => ({ ...prev, [discussionId]: "" }));
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
    if (type === "discussion") setEditDiscussion({ id, topic: content });
    else setEditComment({ id, content });
  };

  const handleDelete = (id: string, type: "discussion" | "comment") => {
    setDeleteDialog({ type, id });
  };

  const handleSaveEdit = async () => {
    try {
      if (editDiscussion) {
        await editDiscussionMutation({
          discussionId: editDiscussion.id,
          topic: editDiscussion.topic,
        }).unwrap();
        setEditDiscussion(null);
        refetchDiscussions();
      } else if (editComment) {
        await editCommentMutation({
          commentId: editComment.id,
          content: editComment.content,
        }).unwrap();
        setEditComment(null);
        refetchThread();
      }
    } catch (error) {
      console.error(
        `Failed to edit ${editDiscussion ? "discussion" : "comment"}:`,
        error
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog) return;
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
        <div className="flex gap-3 flex-shrink-0">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Start a new discussion..."
            className="rounded-full border-gray-300 shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-gray-800 placeholder-gray-500"
            onKeyPress={(e) => e.key === "Enter" && handleCreateDiscussion()}
          />
          <Button
            onClick={handleCreateDiscussion}
            className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-md transition-all duration-300"
          >
            Post
          </Button>
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
                  onCommentChange={(id, value) =>
                    setCommentInputs((prev) => ({ ...prev, [id]: value }))
                  }
                  onCreateComment={handleCreateComment}
                  scrollAreaRef={(el) =>
                    (scrollAreaRefs.current[discussion._id] = el)
                  }
                />
              ))
            )}
          </Accordion>
        </ScrollArea>
      </CardContent>

      {/* Edit Dialog (Unified for Discussion and Comment) */}
      <Dialog
        open={!!(editDiscussion || editComment)}
        onOpenChange={() => {
          setEditDiscussion(null);
          setEditComment(null);
        }}
      >
        <DialogContent className="sm:max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {editDiscussion ? "Edit Discussion" : "Edit Comment"}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={editDiscussion?.topic || editComment?.content || ""}
            onChange={(e) =>
              editDiscussion
                ? setEditDiscussion({
                    ...editDiscussion,
                    topic: e.target.value,
                  })
                : setEditComment({ ...editComment!, content: e.target.value })
            }
            className="border-gray-300 focus:ring-2 focus:ring-teal-500"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDiscussion(null);
                setEditComment(null);
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

      {/* Delete Confirmation Dialog */}
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
