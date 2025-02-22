// src/services/paymentService.ts
import razorpay from "../utils/razorpay";
import {
  createPayment,
  updatePaymentStatus,
} from "../repositories/payment.repository";

export const createRazorpayOrder = async (amount: number) => {
  const options = {
    amount: amount * 100,
    currency: "INR",
  };

  const order = await razorpay.orders.create(options);
  await createPayment({ orderId: order.id, amount: order.amount as number });
  return order;
};

export const verifyRazorpayPayment = async (paymentData: any) => {
  const { razorpay_payment_id, razorpay_order_id } = paymentData;

  // Verify payment with Razorpay
  const payment = await razorpay.payments.fetch(razorpay_payment_id);
  if (payment.status === "captured") {
    await updatePaymentStatus(razorpay_order_id, "completed");
    return { success: true };
  }

  return { success: false };
};
