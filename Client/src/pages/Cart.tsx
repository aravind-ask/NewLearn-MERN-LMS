import { useNavigate } from "react-router-dom";
import { useGetCartQuery } from "@/redux/services/courseApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Trash } from "lucide-react";
import { useRemoveFromCartMutation } from "@/redux/services/courseApi";
import { useDispatch } from "react-redux";
import { removeFromCart } from "@/redux/slices/userSlice";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: cart, isLoading, isError, error } = useGetCartQuery();
  const [removeFromCartApi] = useRemoveFromCartMutation();

  const totalCartValue =
    cart?.data?.reduce((total, course) => total + course.pricing, 0) || 0;

  const handleRemoveFromCart = async (courseId: string) => {
    try {
      await removeFromCartApi(courseId).unwrap();
      dispatch(removeFromCart(courseId));
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (isLoading) return <Skeleton />;
  if (isError)
    return (
      <p className="text-red-600 flex justify-center items-center">
        Failed to load cart: {error?.data?.message}
      </p>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mt-4 mb-8 gap-4">
        <div className="flex items-center gap-4">
          <ShoppingCart className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="cursor-pointer"
        >
          Go Back
        </Button>
      </div>
      {cart?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <p className="text-xl text-gray-600">Your cart is empty</p>
          <Button onClick={() => navigate("/all-courses")} className="mt-4">
            Explore Courses
          </Button>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-grow">
            <div className="space-y-6">
              {cart?.data?.map((course) => (
                <Card
                  key={course._id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  <CardContent className="flex gap-4 p-4">
                    <div className="w-48 h-32 flex-shrink-0">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mb-1">
                        Created By{" "}
                        <span className="font-bold">
                          {course.instructorName}
                        </span>
                      </p>
                      <p className="text-[16px] text-gray-600 mt-3 mb-2">
                        {`${course.curriculum?.length || 0} ${
                          course.curriculum?.length <= 1
                            ? "Lecture"
                            : "Lectures"
                        } - ${course.level.toUpperCase()} Level`}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold">₹ {course.pricing}</p>
                        <Button
                          variant="destructive"
                          onClick={() => handleRemoveFromCart(course._id)}
                          className="cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="w-full md:w-96">
            <Card className="sticky top-22">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold">₹ {totalCartValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-bold">
                      ₹ {(totalCartValue * 0.18).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold">
                      ₹ {(totalCartValue * 1.18).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full mt-4 cursor-pointer"
                    disabled={cart?.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
