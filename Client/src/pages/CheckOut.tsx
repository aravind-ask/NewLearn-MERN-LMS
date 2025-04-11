// src/pages/CheckoutPage.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ShoppingCart,
  Wallet,
  Loader,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import {
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} from "@/redux/services/paymentApi";
import { useGetCartQuery } from "@/redux/services/courseApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const CheckoutPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const cartItems = location.state?.cartItems || [];
  const courseDetails = location.state?.courseDetails;
  const itemsToCheckout = courseDetails ? [courseDetails] : cartItems;
  const [hasProcessed, setHasProcessed] = useState(false); // Track if payment was attempted

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [discount, setDiscount] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for dialog error

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

  const handleRazorpayPayment = async () => {
    if (hasProcessed) {
      setErrorMessage(
        "Payment process has already been initiated. Please wait or refresh the page."
      );
      return;
    }

    setIsPlacingOrder(true);
    setHasProcessed(true);
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
            navigate("/order-confirmation", { state: { order, courses } });
          } else {
            setErrorMessage("Payment failed. Please try again.");
            setHasProcessed(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: "9999999999",
        },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: () => {
            setHasProcessed(false);
            setIsPlacingOrder(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment failed:", error);
      if (error.status === 409) {
        setErrorMessage(
          "Another payment for this course is in progress. Please wait a moment and try again."
        );
      } else if (error.data?.message?.includes("already enrolled")) {
        setErrorMessage(error.data.message);
        navigate("/dashboard");
      } else {
        setErrorMessage("An error occurred during payment. Please try again.");
        setHasProcessed(false);
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const closeErrorDialog = () => {
    setErrorMessage(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with Progress */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-teal-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Checkout
          </h1>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-800"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>
      </motion.div>
      <Progress value={66} className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Your Courses ({normalizedItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {normalizedItems.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No items to checkout.
                </p>
              ) : (
                normalizedItems.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-24 h-16 flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-md shadow-sm"
                      />
                      {item.appliedOffer && (
                        <Badge className="absolute -top-2 -right-2 bg-teal-500 text-white">
                          {item.appliedOffer.discountPercentage}% OFF
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        By {item.instructorName}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-teal-600">
                          ₹{item.discountedPrice.toFixed(2)}
                        </span>
                        {item.appliedOffer && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{item.pricing}
                          </span>
                        )}
                      </div>
                      {item.appliedOffer && (
                        <p className="text-xs text-teal-600 mt-1">
                          Offer: {item.appliedOffer.title}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Order Summary */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Price</span>
                  <span className="text-gray-500 line-through">
                    ₹{originalSubtotal.toFixed(2)}
                  </span>
                </div>
                {offerDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Offer Discount</span>
                    <span className="text-teal-600">
                      -₹{offerDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coupon Discount</span>
                    <span className="text-teal-600">
                      -₹{discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-3">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-lg text-teal-600">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm"
                >
                  <RadioGroupItem value="razorpay" id="razorpay" />
                  <Label
                    htmlFor="razorpay"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Wallet className="h-5 w-5 text-teal-600" />
                    Razorpay
                  </Label>
                </motion.div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button
            onClick={handleRazorpayPayment}
            disabled={
              normalizedItems.length === 0 || isPlacingOrder || hasProcessed
            }
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isPlacingOrder ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Place Order
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Error Dialog */}
      <Dialog open={!!errorMessage} onOpenChange={closeErrorDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Payment Error
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">{errorMessage}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={closeErrorDialog}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage;
