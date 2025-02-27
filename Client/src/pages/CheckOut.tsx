import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShoppingCart, CreditCard, Wallet, Gift, Loader } from "lucide-react";
import { useState } from "react";
import Razorpay from "razorpay";
import {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} from "@/redux/services/paymentApi";
import { useGetCartQuery } from "@/redux/services/courseApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const CheckoutPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const cartItems = location.state?.cartItems || [];
  const courseDetails = location.state?.courseDetails;
  const itemsToCheckout = courseDetails ? [courseDetails] : cartItems;

  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyRazorpayPayment] = useVerifyRazorpayPaymentMutation();
  const { data: cart } = useGetCartQuery();

  const subtotal =
    itemsToCheckout?.reduce((total, course) => total + course.pricing, 0) || 0;
  // const tax = subtotal * 0.18;
  const total = Math.round(subtotal - discount);

  const handleApplyCoupon = () => {
    setIsApplyingCoupon(true);
    setCouponError("");
    setTimeout(() => {
      if (couponCode === "LEARN10") {
        setDiscount(subtotal * 0.1); // 10% discount
      } else {
        setCouponError("Invalid coupon code");
      }
      setIsApplyingCoupon(false);
    }, 1000);
  };

  const handleRazorpayPayment = async () => {
    setIsPlacingOrder(true);

    try {
      const courses = itemsToCheckout.map((course) => ({
        courseId: course._id,
        courseTitle: course.title,
        courseImage: course.image,
        coursePrice: course.pricing,
        instructorId: course.instructorId,
        instructorName: course.instructorName,
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
        amount: total,
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
          <ShoppingCart className="h-8 w-8 text-blue-600" />
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
        {/* Left Column - Order Details */}
        <div className="col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {itemsToCheckout?.map((course) => (
                  <div
                    key={course._id}
                    className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="w-32 h-20 flex-shrink-0">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        By {course.instructorName}
                      </p>
                      <p className="text-lg font-bold mt-2 text-blue-600">
                        ₹ {course.pricing}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment, Coupon, and Order Summary */}
        <div className="col-span-1 space-y-8">
          {/* Order Summary */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold">₹ {subtotal.toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="font-bold">₹ {tax.toFixed(2)}</span>
                </div> */}
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-bold text-green-600">
                      -₹ {discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-4">
                  <span className="text-gray-600 font-semibold">Total</span>
                  <span className="font-bold text-lg text-blue-600">
                    ₹ {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coupon Section */}
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
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors"
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

          {/* Payment Method */}
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
                {/* <div className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label
                    htmlFor="credit-card"
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Credit/Debit Card
                  </Label>
                </div> */}
                <div className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    Razorpay
                  </Label>
                </div>
                {/* <div className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    Stripe
                  </Label>
                </div> */}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button
            onClick={handleRazorpayPayment}
            className="w-full mt-4 cursor-pointer bg-blue-100 text-black hover:bg-black hover:text-white transition-colors"
            disabled={itemsToCheckout.length === 0 || isPlacingOrder}
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
