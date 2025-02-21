import { useNavigate } from "react-router-dom";
import { useGetWishlistQuery } from "@/redux/services/courseApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Trash, ShoppingCart } from "lucide-react";
import {
  useRemoveFromWishlistMutation,
  useAddToCartMutation,
} from "@/redux/services/courseApi";
import { useDispatch } from "react-redux";
import { removeFromWishlist, addToCart } from "@/redux/slices/userSlice";

const WishlistPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: wishlist, isLoading, isError, error } = useGetWishlistQuery();
  const [removeFromWishlistApi] = useRemoveFromWishlistMutation();
  const [addToCartApi] = useAddToCartMutation();

  const handleRemoveFromWishlist = async (courseId: string) => {
    try {
      await removeFromWishlistApi(courseId).unwrap();
      dispatch(removeFromWishlist(courseId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const handleMoveToCart = async (courseId: string) => {
    try {
      await addToCartApi(courseId).unwrap();
      dispatch(addToCart(wishlist?.data?.find((course) => course._id === courseId)));
      await removeFromWishlistApi(courseId).unwrap();
      dispatch(removeFromWishlist(courseId));
    } catch (error) {
      console.error("Failed to move to cart:", error);
    }
  };

  if (isLoading) return <Skeleton />;
  if (isError)
    return (
      <p className="text-red-600 flex justify-center items-center">
        Failed to load wishlist: {error?.data?.message}
      </p>
    );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
      {wishlist?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Heart className="h-16 w-16 mb-4 text-gray-400" />
          <p className="text-xl text-gray-600">Your wishlist is empty</p>
          <Button onClick={() => navigate("/all-courses")} className="mt-4">
            Explore Courses
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {wishlist?.data?.map((course) => (
            <Card
              key={course._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold">₹ {course.pricing}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveFromWishlist(course._id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                    <Button onClick={() => handleMoveToCart(course._id)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Move to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
