import { useNavigate } from "react-router-dom";
import { useGetCartQuery } from "@/redux/services/courseApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Trash } from "lucide-react";
import { useRemoveFromCartMutation } from "@/redux/services/courseApi";
import { useDispatch } from "react-redux";
import { removeFromCart } from "@/redux/slices/userSlice";
import { Badge } from "@/components/ui/badge";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: cart, isLoading, isError, error } = useGetCartQuery();
  const [removeFromCartApi] = useRemoveFromCartMutation();

  // Calculate totals considering discounted prices
  const calculateTotals = () => {
    if (!cart?.data?.items)
      return { subtotal: 0, originalTotal: 0, totalSavings: 0 };

    const originalTotal = cart.data.items.reduce(
      (total, item) => total + item.course.pricing,
      0
    );

    const subtotal = cart.data.items.reduce((total, item) => {
      const discount = item.offer?.discountPercentage || 0;
      const discountedPrice = item.course.pricing * (1 - discount / 100);
      return total + discountedPrice;
    }, 0);

    const totalSavings = originalTotal - subtotal;

    return { subtotal, originalTotal, totalSavings };
  };

  const { subtotal, originalTotal, totalSavings } = calculateTotals();

  const handleRemoveFromCart = async (courseId: string) => {
    try {
      await removeFromCartApi(courseId).unwrap();
      dispatch(removeFromCart(courseId));
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout", { state: { cartItems: cart?.data?.items } });
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
          <h1 className="text-3xl font-bold">Cart</h1>
        </div>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="cursor-pointer hover:bg-black hover:text-white hover:font-bold"
        >
          Go Back
        </Button>
      </div>
      {cart?.data?.items?.length === 0 ? (
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
              {cart?.data?.items?.map((item) => {
                const course = item.course;
                const discount = item.offer?.discountPercentage || 0;
                const discountedPrice = course.pricing * (1 - discount / 100);

                return (
                  <Card
                    key={course._id}
                    className="cursor-pointer relative hover:shadow-lg transition-all duration-300"
                    onClick={() => navigate(`/course/${course._id}`)}
                  >
                    <CardContent className="flex gap-4 p-4">
                      <div className="w-48 h-32 flex-shrink-0 relative">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                        {item.offer && (
                          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white">
                            {item.offer.discountPercentage}% OFF
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <CardTitle className="text-xl mb-2 line-clamp-2">
                            {course.title}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mb-1">
                            Created By{" "}
                            <span className="font-bold">
                              {course.instructorName}
                            </span>
                          </p>
                          <p className="text-[16px] text-gray-600 mb-2">
                            {`${course.curriculum?.length || 0} ${
                              course.curriculum?.length <= 1
                                ? "Lecture"
                                : "Lectures"
                            } - ${course.level.toUpperCase()} Level`}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-bold text-teal-600">
                                ₹
                                {discount > 0
                                  ? discountedPrice.toFixed(2)
                                  : course.pricing}
                              </p>
                              {discount > 0 && (
                                <p className="text-sm text-gray-500 line-through">
                                  ₹{course.pricing}
                                </p>
                              )}
                            </div>
                            {item.offer && (
                              <p className="text-xs text-green-600">
                                {item.offer.title} Applied
                              </p>
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromCart(course._id);
                            }}
                            className="cursor-pointer"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                    <span className="text-gray-600">Original Price</span>
                    <span className="text-gray-500 line-through">
                      ₹{originalTotal}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Savings</span>
                      <span className="font-bold text-green-600">
                        -₹{totalSavings.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-teal-600">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full mt-4 cursor-pointer bg-teal-500 hover:bg-teal-600 text-white"
                    disabled={cart?.data?.items?.length === 0}
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
