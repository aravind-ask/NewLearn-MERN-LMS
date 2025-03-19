// src/components/Discussions.tsx
import { useEffect, useState, useRef, useCallback } from "react";
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

export default function Discussions({ lectureId }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { discussions } = useSelector((state: RootState) => state.discussion);
  const dispatch = useDispatch();
  const [topic, setTopic] = useState("");
  const [expandedDiscussionId, setExpandedDiscussionId] = useState<
    string | null
  >(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );
  const [editDiscussionId, setEditDiscussionId] = useState<string | null>(null);
  const [editDiscussionTopic, setEditDiscussionTopic] = useState("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    type: "discussion" | "comment";
    id: string;
  } | null>(null);
  const scrollAreaRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const discussionsScrollRef = useRef<HTMLDivElement>(null);

  const { data: discussionData, refetch: refetchDiscussions } =
    useGetDiscussionsByLectureQuery(lectureId);
  const [createDiscussion] = useCreateDiscussionMutation();
  const { data: currentDiscussionData, refetch: refetchThread } =
    useGetDiscussionByIdQuery(expandedDiscussionId || "", {
      skip: !expandedDiscussionId,
    });
  const [createComment] = useCreateCommentMutation();
  const [editDiscussionMutation] = useEditDiscussionMutation();
  const [deleteDiscussionMutation] = useDeleteDiscussionMutation();
  const [editCommentMutation] = useEditCommentMutation();
  const [deleteCommentMutation] = useDeleteCommentMutation();

  // Socket.IO listeners
  useEffect(() => {
    socket.emit("joinLectureRoom", { lectureId });
    socket.on("newDiscussion", (newDiscussion) => {
      if (newDiscussion.lectureId === lectureId) {
        dispatch(addDiscussion(newDiscussion));
        scrollDiscussionsToTop();
      }
    });
    socket.on("editDiscussion", (updatedDiscussion) => {
      if (updatedDiscussion.lectureId === lectureId) {
        dispatch(editDiscussion(updatedDiscussion));
      }
    });
    socket.on("deleteDiscussion", ({ discussionId }) => {
      dispatch(deleteDiscussion(discussionId));
    });

    return () => {
      socket.off("newDiscussion");
      socket.off("editDiscussion");
      socket.off("deleteDiscussion");
    };
  }, [lectureId, dispatch]);

  useEffect(() => {
    if (expandedDiscussionId) {
      socket.emit("joinDiscussionRoom", { discussionId: expandedDiscussionId });
      socket.on("newComment", (newComment) => {
        if (newComment.discussionId === expandedDiscussionId) {
          dispatch(addComment(newComment));
          scrollToBottom(expandedDiscussionId);
        }
      });
      socket.on("editComment", (updatedComment) => {
        if (updatedComment.discussionId === expandedDiscussionId) {
          dispatch(editComment(updatedComment));
        }
      });
      socket.on("deleteComment", ({ commentId }) => {
        dispatch(deleteComment(commentId));
      });

      return () => {
        socket.off("newComment");
        socket.off("editComment");
        socket.off("deleteComment");
      };
    }
  }, [expandedDiscussionId, dispatch]);

  // Update state
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
    if (discussionsScrollRef.current) {
      const scrollContainer = discussionsScrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) scrollContainer.scrollTop = 0;
    }
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

  const handleEditDiscussion = async () => {
    if (!editDiscussionId || !editDiscussionTopic.trim()) return;
    try {
      await editDiscussionMutation({
        discussionId: editDiscussionId,
        topic: editDiscussionTopic,
      }).unwrap();
      setEditDiscussionId(null);
      setEditDiscussionTopic("");
      refetchDiscussions();
    } catch (error) {
      console.error("Failed to edit discussion:", error);
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!deleteDialog || deleteDialog.type !== "discussion") return;
    try {
      await deleteDiscussionMutation(deleteDialog.id).unwrap();
      setDeleteDialog(null);
      refetchDiscussions();
    } catch (error) {
      console.error("Failed to delete discussion:", error);
    }
  };

  const handleEditComment = async () => {
    if (!editCommentId || !editCommentContent.trim()) return;
    try {
      await editCommentMutation({
        commentId: editCommentId,
        content: editCommentContent,
      }).unwrap();
      setEditCommentId(null);
      setEditCommentContent("");
      refetchThread();
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteDialog || deleteDialog.type !== "comment") return;
    try {
      await deleteCommentMutation(deleteDialog.id).unwrap();
      setDeleteDialog(null);
      refetchThread();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleToggleThread = (discussionId: string) => {
    setExpandedDiscussionId(
      expandedDiscussionId === discussionId ? null : discussionId
    );
  };

  return (
    <Card className="shadow-xl rounded-xl border border-gray-200 bg-white h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6 flex-shrink-0">
        <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-teal-500" />
          Lecture Discussions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col gap-6 overflow-hidden">
        {/* New Discussion Input */}
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

        {/* Scrollable Discussions List */}
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
                <AccordionItem
                  key={discussion._id}
                  value={discussion._id}
                  className="border border-gray-200 rounded-lg shadow-sm мониторингshadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <AccordionTrigger
                    onClick={() => handleToggleThread(discussion._id)}
                    className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 text-gray-800"
                  >
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-lg">
                        {discussion.topic}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Started by {discussion.userId.name} •{" "}
                        {discussion.commentsCount} comments
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {discussion.userId._id === user?.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditDiscussionId(discussion._id);
                              setEditDiscussionTopic(discussion.topic);
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
                              setDeleteDialog({
                                type: "discussion",
                                id: discussion._id,
                              });
                            }}
                            className="text-gray-600 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {expandedDiscussionId === discussion._id ? (
                        <ChevronUp className="h-5 w-5 text-teal-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-white">
                    {expandedDiscussionId === discussion._id &&
                      currentDiscussionData?.data && (
                        <div className="flex flex-col gap-4">
                          <ScrollArea
                            ref={(el) =>
                              (scrollAreaRefs.current[discussion._id] = el)
                            }
                            className="h-[200px] p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="space-y-4">
                              {currentDiscussionData.data.comments.length ===
                              0 ? (
                                <p className="text-gray-500 text-center italic">
                                  No comments yet.
                                </p>
                              ) : (
                                currentDiscussionData.data.comments.map(
                                  (comment) => (
                                    <div
                                      key={comment._id}
                                      className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors duration-200 flex justify-between items-start"
                                    >
                                      <div>
                                        <p className="text-sm text-gray-800">
                                          {comment.content}
                                        </p>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {comment.userId.name} •{" "}
                                          {new Date(
                                            comment.createdAt
                                          ).toLocaleString([], {
                                            dateStyle: "short",
                                            timeStyle: "short",
                                          })}
                                        </div>
                                      </div>
                                      {comment.userId._id === user?.id && (
                                        <div className="flex gap-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                              setEditCommentId(comment._id);
                                              setEditCommentContent(
                                                comment.content
                                              );
                                            }}
                                            className="text-gray-600 hover:text-teal-500"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              setDeleteDialog({
                                                type: "comment",
                                                id: comment._id,
                                              })
                                            }
                                            className="text-gray-600 hover:text-red-500"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )
                                )
                              )}
                            </div>
                          </ScrollArea>
                          <div className="flex gap-3">
                            <Input
                              value={commentInputs[discussion._id] || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [discussion._id]: e.target.value,
                                }))
                              }
                              placeholder="Add a comment..."
                              className="rounded-full border-gray-300 shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-gray-800 placeholder-gray-500"
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                handleCreateComment(discussion._id)
                              }
                            />
                            <Button
                              onClick={() =>
                                handleCreateComment(discussion._id)
                              }
                              className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-md transition-all duration-300"
                            >
                              Comment
                            </Button>
                          </div>
                        </div>
                      )}
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </ScrollArea>
      </CardContent>

      {/* Edit Discussion Dialog */}
      <Dialog
        open={!!editDiscussionId}
        onOpenChange={() => setEditDiscussionId(null)}
      >
        <DialogContent className="sm:max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Discussion</DialogTitle>
          </DialogHeader>
          <Input
            value={editDiscussionTopic}
            onChange={(e) => setEditDiscussionTopic(e.target.value)}
            className="border-gray-300 focus:ring-2 focus:ring-teal-500"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDiscussionId(null)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditDiscussion}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Comment Dialog */}
      <Dialog
        open={!!editCommentId}
        onOpenChange={() => setEditCommentId(null)}
      >
        <DialogContent className="sm:max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Comment</DialogTitle>
          </DialogHeader>
          <Input
            value={editCommentContent}
            onChange={(e) => setEditCommentContent(e.target.value)}
            className="border-gray-300 focus:ring-2 focus:ring-teal-500"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditCommentId(null)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditComment}
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
              onClick={
                deleteDialog?.type === "discussion"
                  ? handleDeleteDiscussion
                  : handleDeleteComment
              }
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
