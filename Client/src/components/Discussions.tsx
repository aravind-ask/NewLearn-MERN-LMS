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
  useGetDiscussionsByLectureQuery,
  useCreateDiscussionMutation,
  useGetDiscussionByIdQuery,
  useCreateCommentMutation,
} from "@/redux/services/discussionApi";
import {
  setDiscussions,
  addDiscussion,
  setCurrentDiscussion,
  addComment,
} from "@/redux/slices/discussionSlice";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

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
  const scrollAreaRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { data: discussionData, refetch: refetchDiscussions } =
    useGetDiscussionsByLectureQuery(lectureId);
  const [createDiscussion] = useCreateDiscussionMutation();
  const { data: currentDiscussionData, refetch: refetchThread } =
    useGetDiscussionByIdQuery(expandedDiscussionId || "", {
      skip: !expandedDiscussionId,
    });
  const [createComment] = useCreateCommentMutation();

  // Join lecture room and listen for new discussions
  useEffect(() => {
    socket.emit("joinLectureRoom", { lectureId });
    socket.on("newDiscussion", (newDiscussion) => {
      if (newDiscussion.lectureId === lectureId) {
        dispatch(addDiscussion(newDiscussion));
      }
    });

    return () => {
      socket.off("newDiscussion");
    };
  }, [lectureId, dispatch]);

  useEffect(() => {
    if (discussionData?.data) {
      dispatch(setDiscussions(discussionData.data));
    }
  }, [discussionData, dispatch]);

  useEffect(() => {
    if (expandedDiscussionId) {
      socket.emit("joinDiscussionRoom", { discussionId: expandedDiscussionId });
      socket.on("newComment", (newComment) => {
        if (newComment.discussionId === expandedDiscussionId) {
          dispatch(addComment(newComment));
          scrollToBottom(expandedDiscussionId);
        }
      });

      return () => {
        socket.off("newComment");
      };
    }
  }, [expandedDiscussionId, dispatch]);

  // Update current discussion when thread data is fetched
  useEffect(() => {
    if (currentDiscussionData?.data) {
      dispatch(setCurrentDiscussion(currentDiscussionData.data));
      scrollToBottom(expandedDiscussionId!);
    }
  }, [currentDiscussionData, dispatch]);

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

  const handleToggleThread = (discussionId: string) => {
    setExpandedDiscussionId(
      expandedDiscussionId === discussionId ? null : discussionId
    );
  };

  return (
    <Card className=" min-h-[500px] shadow-xl rounded-xl border border-gray-200 bg-white">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6">
        <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-teal-500" />
          Lecture Discussions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* New Discussion Input */}
        <div className="mb-8 flex gap-3">
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

        {/* Discussions List */}
        <Accordion type="single" collapsible className="space-y-4">
          {discussions.length === 0 ? (
            <p className="text-gray-500 text-center italic">
              No discussions yet. Start one above!
            </p>
          ) : (
            discussions.map((discussion) => (
              <AccordionItem
                key={discussion._id}
                value={discussion._id}
                className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
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
                  {expandedDiscussionId === discussion._id ? (
                    <ChevronUp className="h-5 w-5 text-teal-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-white">
                  {expandedDiscussionId === discussion._id &&
                    currentDiscussionData?.data && (
                      <div className="flex flex-col gap-4">
                        {/* Comments Section */}
                        <ScrollArea
                          ref={(el) =>
                            (scrollAreaRefs.current[discussion._id] = el)
                          }
                          className="h-[300px] p-4 bg-gray-50 rounded-lg border border-gray-200"
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
                                    className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                                  >
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
                                )
                              )
                            )}
                          </div>
                        </ScrollArea>

                        {/* Comment Input */}
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
                            onClick={() => handleCreateComment(discussion._id)}
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
      </CardContent>
    </Card>
  );
}
