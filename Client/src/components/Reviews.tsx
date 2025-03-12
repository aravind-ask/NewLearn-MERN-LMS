import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Pencil, Trash2 } from "lucide-react";
import {
  useGetReviewsByCourseIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "@/redux/services/ratingsApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function Reviews({ courseId }: { courseId?: string }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [visibleReviews, setVisibleReviews] = useState<Review[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const limit = 5;

  // Log courseId for debugging
  useEffect(() => {
    console.log("Received courseId:", courseId);
  }, [courseId]);

  // Fetch reviews incrementally
  const { data, isFetching, refetch } = useGetReviewsByCourseIdQuery(
    { courseId: courseId!, limit, offset },
    { skip: !courseId }
  );

  // Check if user has reviewed using initial fetch
  const { data: initialReviews } = useGetReviewsByCourseIdQuery(
    { courseId: courseId!, limit: 1, offset: 0 },
    { skip: !courseId }
  );
  const hasReviewed = initialReviews?.data.reviews.some(
    (review) => review.userId === user?.id
  );

  const [createReview] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  // Append new reviews
  useEffect(() => {
    if (data?.data.reviews && !isFetching) {
      setVisibleReviews((prev) => [...prev, ...data.data.reviews]);
      setHasMore(
        data.data.reviews.length === limit &&
          visibleReviews.length + data.data.reviews.length < data.data.total
      );
    }
  }, [data, isFetching]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isFetching && courseId) {
          setOffset((prev) => prev + limit);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, isFetching, courseId]);

  // Reset on courseId change or after mutations
  useEffect(() => {
    setVisibleReviews([]);
    setOffset(0);
    setHasMore(true);
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) {
      toast.error("Course ID is missing.");
      return;
    }
    if (rating < 1 || rating > 5) {
      toast.error("Rating must be between 1 and 5.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      if (editingReviewId) {
        await updateReview({
          reviewId: editingReviewId,
          rating,
          comment,
        }).unwrap();
        toast.success("Review updated successfully");
        setEditingReviewId(null);
      } else {
        await createReview({
          courseId,
          userId: user?.id,
          userName: user?.name,
          rating,
          comment,
        }).unwrap();
        toast.success("Review submitted successfully");
      }
      setRating(0);
      setComment("");
      refetch();
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleDeleteReview = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteReview(deleteConfirm).unwrap();
      toast.success("Review deleted successfully");
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  if (!courseId) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error: Course ID is missing. Please provide a valid course ID.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex gap-6">
        {/* Reviews List with Infinite Scroll */}
        <div className="flex-1 max-h-[600px] overflow-y-auto pr-4">
          {visibleReviews.length > 0 ? (
            visibleReviews.map((review) => (
              <div key={review._id} className="border-b pb-4 mb-4">
                <div className="font-bold text-gray-900">{review.userName}</div>
                <div className="text-yellow-500">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>
                <div className="text-gray-600">{review.comment}</div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
                {review.userId === user?.id && (
                  <div className="mt-2 space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditReview(review)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirm(review._id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : isFetching ? (
            <div className="text-center py-10 text-gray-500">
              Loading reviews...
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No reviews yet
            </div>
          )}
          {hasMore && (
            <div ref={loaderRef} className="text-center py-4 text-gray-500">
              {isFetching ? "Loading more reviews..." : "Scroll to load more"}
            </div>
          )}
        </div>

        {/* Review Form */}
        {!hasReviewed || editingReviewId ? (
          <div className="w-[400px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editingReviewId ? "Edit Your Review" : "Add Your Review"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="rating"
                  className="block text-sm font-medium text-gray-700"
                >
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    placeholder="1-5"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    className="w-24 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700"
                >
                  Comment
                </label>
                <Textarea
                  id="comment"
                  placeholder="Write your review here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isUpdating}
                >
                  {editingReviewId
                    ? isUpdating
                      ? "Updating..."
                      : "Update Review"
                    : "Submit Review"}
                </Button>
                {editingReviewId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingReviewId(null);
                      setRating(0);
                      setComment("");
                    }}
                    disabled={isUpdating}
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="w-[400px] text-gray-600">
            You have already submitted a review for this course.
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Delete Review
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete this review? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
