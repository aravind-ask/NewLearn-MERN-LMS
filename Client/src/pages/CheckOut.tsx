import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShoppingCart, CreditCard, Wallet, Gift, Loader } from "lucide-react";
import { useState } from "react";
import {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} from "@/redux/services/paymentApi";
import { useGetCartQuery } from "@/redux/services/courseApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Badge } from "@/components/ui/badge";

const CheckoutPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const cartItems = location.state?.cartItems || [];
  const courseDetails = location.state?.courseDetails;
  const itemsToCheckout = courseDetails ? [courseDetails] : cartItems;

  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation();
  const { data: cart } = useGetCartQuery();

  // Normalize item structure and calculate totals
  const normalizedItems = itemsToCheckout.map((item) => ({
    _id: item.course?._id || item._id,
    title: item.course?.title || item.title,
    image: item.course?.image || item.image,
    pricing: item.course?.pricing || item.pricing,
    instructorId: item.course?.instructorId || item.instructorId,
    instructorName: item.course?.instructorName || item.instructorName,
    appliedOffer: item.offer || item.appliedOffer,
    discountedPrice: item.course
      ? item.offer
        ? item.course.pricing * (1 - item.offer.discountPercentage / 100)
        : item.course.pricing
      : item.discountedPrice || item.pricing,
  }));

  const originalSubtotal = normalizedItems.reduce(
    (total, item) => total + item.pricing,
    0
  );

  const subtotal = normalizedItems.reduce(
    (total, item) => total + (item.discountedPrice || item.pricing),
    0
  );

  const offerDiscount = originalSubtotal - subtotal;
  const total = Math.round(subtotal - discount);

  const handleApplyCoupon = () => {
    setIsApplyingCoupon(true);
    setCouponError("");
    setTimeout(() => {
      if (couponCode === "LEARN10") {
        setDiscount(subtotal * 0.1);
      } else {
        setCouponError("Invalid coupon code");
      }
      setIsApplyingCoupon(false);
    }, 1000);
  };

  const handleRazorpayPayment = async () => {
    setIsPlacingOrder(true);

    try {
      const courses = normalizedItems.map((item) => ({
        courseId: item._id,
        courseTitle: item.title,
        courseImage: item.image,
        coursePrice: item.discountedPrice || item.pricing,
        instructorId: item.instructorId,
        instructorName: item.instructorName,
      }));

      const order = await createRazorpayOrder({
        amount: total,
        courses,
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email,
      }).unwrap();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: "INR",
        name: "NewLearn-LMS",
        description: "Course Purchase",
        order_id: order.data.id,
        handler: async (response) => {
          const verificationResult = await verifyRazorpayPayment(
            response
          ).unwrap();

          if (verificationResult.success) {
            navigate("/order-confirmation");
          } else {
            alert("Payment failed. Please try again.");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: "9999999999",
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mt-4 mb-8 gap-4">
        <div className="flex items-center gap-4">
          <ShoppingCart className="h-8 w-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </div>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="cursor-pointer hover:bg-gray-100 transition-colors"
        >
          Go Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {normalizedItems?.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow relative"
                  >
                    <div className="w-32 h-20 flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {item.appliedOffer && (
                        <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white">
                          {item.appliedOffer.discountPercentage}% OFF
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        By {item.instructorName}
                      </p>
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-teal-600">
                            ₹{item.discountedPrice.toFixed(2)}
                          </p>
                          {item.appliedOffer && (
                            <p className="text-sm text-gray-500 line-through">
                              ₹{item.pricing}
                            </p>
                          )}
                        </div>
                        {item.appliedOffer && (
                          <p className="text-xs text-green-600">
                            {item.appliedOffer.title} Applied
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Price</span>
                  <span className="font-bold text-gray-500 line-through">
                    ₹ {originalSubtotal.toFixed(2)}
                  </span>
                </div>
                {offerDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Offer Discount</span>
                    <span className="font-bold text-green-600">
                      -₹ {offerDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold">₹ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coupon Discount</span>
                    <span className="font-bold text-green-600">
                      -₹ {discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-4">
                  <span className="text-gray-600 font-semibold">Total</span>
                  <span className="font-bold text-lg text-teal-600">
                    ₹ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Apply Coupon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                  className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 transition-colors"
                >
                  {isApplyingCoupon ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Gift className="h-4 w-4" />
                  )}
                  {isApplyingCoupon ? "Applying..." : "Apply"}
                </Button>
              </div>
              {couponError && (
                <p className="text-red-600 mt-2 text-sm">{couponError}</p>
              )}
              {discount > 0 && (
                <p className="text-green-600 mt-2 text-sm">
                  ₹ {discount.toFixed(2)} discount applied!
                </p>
              )}
            </CardContent>
          </Card> */}

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-4"
              >
                <div className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-teal-600" />
                    Razorpay
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Button
            onClick={handleRazorpayPayment}
            className="w-full mt-4 cursor-pointer bg-teal-500 text-white hover:bg-teal-600 transition-colors"
            disabled={normalizedItems.length === 0 || isPlacingOrder}
          >
            {isPlacingOrder ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "Place Order"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
