import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import {
  useGetReviewsByCourseIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "@/redux/services/ratingsApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function Reviews({ courseId }: { courseId: string }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Fetch reviews for the course
  const { data: reviews, refetch } = useGetReviewsByCourseIdQuery(courseId);

  // Create a new review
  const [createReview] = useCreateReviewMutation();

  // Update a review
  const [updateReview] = useUpdateReviewMutation();

  // Delete a review
  const [deleteReview] = useDeleteReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }
    if (!comment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    try {
      if (editingReviewId) {
        // Update existing review
        await updateReview({
          reviewId: editingReviewId,
          rating,
          comment,
        }).unwrap();
        setEditingReviewId(null); // Reset editing state
      } else {
        // Create new review
        await createReview({
          courseId,
          userId: user?.id,
          userName: user?.name,
          rating,
          comment,
        }).unwrap();
      }
      setRating(0); // Reset form fields
      setComment("");
      refetch(); // Refetch reviews to update the UI
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review._id); // Set the review ID being edited
    setRating(review.rating); // Pre-fill the rating
    setComment(review.comment); // Pre-fill the comment
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId).unwrap();
      refetch(); // Refetch reviews to update the UI
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Left Side: Scrollable Reviews */}
          <div className="flex-1 overflow-y-auto max-h-[600px] pr-4">
            <div className="space-y-4">
              {reviews?.map((review) => (
                <div key={review._id} className="border-b pb-4">
                  <div className="font-bold">{review.userName}</div>
                  <div className="text-yellow-500">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                  <div className="text-gray-400">{review.comment}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                  {/* Edit and Delete buttons (only for the user's own reviews) */}
                  {review.userId === user?.id && (
                    <div className="mt-2 space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditReview(review)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteReview(review._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Fixed Form */}
          <div className="w-[400px]">
            <h3 className="text-lg font-bold mb-4">
              {editingReviewId ? "Edit Your Review" : "Add Your Review"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="rating" className="block text-sm font-medium">
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Rate this course (1-5)"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-24"
                  />
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium">
                  Comment
                </label>
                <Textarea
                  id="comment"
                  placeholder="Write your review here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
              <Button type="submit">
                {editingReviewId ? "Update Review" : "Submit Review"}
              </Button>
              {editingReviewId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingReviewId(null); // Cancel editing
                    setRating(0); // Reset rating
                    setComment(""); // Reset comment
                  }}
                  className="ml-2"
                >
                  Cancel
                </Button>
              )}
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
