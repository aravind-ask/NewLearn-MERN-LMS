// src/components/DiscussionThread.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { socket } from "@/lib/socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useGetDiscussionByIdQuery,
  useCreateCommentMutation,
} from "@/redux/services/discussionApi";
import {
  setCurrentDiscussion,
  addComment,
} from "@/redux/slices/discussionSlice";

export default function DiscussionThread({ discussionId }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentDiscussion } = useSelector(
    (state: RootState) => state.discussion
  );
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: discussionData, refetch } =
    useGetDiscussionByIdQuery(discussionId);
  const [createComment] = useCreateCommentMutation();

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer)
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, []);

  useEffect(() => {
    socket.emit("joinDiscussionRoom", { discussionId });
    socket.on("newComment", (newComment) => {
      if (newComment.discussionId === discussionId) {
        dispatch(addComment(newComment));
        scrollToBottom();
      }
    });

    return () => {
      socket.off("newComment");
    };
  }, [discussionId, dispatch, scrollToBottom]);

  useEffect(() => {
    if (discussionData?.data) {
      dispatch(setCurrentDiscussion(discussionData.data));
      scrollToBottom();
    }
  }, [discussionData, dispatch, scrollToBottom]);

  const handleCreateComment = async () => {
    if (!content.trim()) return;
    try {
      await createComment({ discussionId, content }).unwrap();
      setContent("");
      refetch();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] shadow-lg rounded-xl border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <CardTitle className="text-xl font-semibold text-gray-800">
          {currentDiscussion?.topic || "Loading..."}
        </CardTitle>
        <div className="text-sm text-gray-600">
          Started by {currentDiscussion?.userId.name || ""}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-gray-50">
          <div className="space-y-4">
            {currentDiscussion?.comments.map((comment) => (
              <div
                key={comment._id}
                className="p-3 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <p className="text-sm text-gray-800">{comment.content}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {comment.userId.name} •{" "}
                  {new Date(comment.createdAt).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 flex gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === "Enter" && handleCreateComment()}
          />
          <Button
            onClick={handleCreateComment}
            className="rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Comment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
