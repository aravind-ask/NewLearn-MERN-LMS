// src/repositories/paymentRepository.ts
import PaymentModel, { IPayment } from "../models/Payment";

export const createPayment = async (paymentData: Partial<IPayment>) => {
  return await PaymentModel.create({
    ...paymentData,
    paymentId: "pending", // Temporary value
    payerId: "pending", // Temporary value
    paymentStatus: "pending", // Default value
    orderStatus: "pending", // Default value
  });
};

export const updatePaymentStatus = async (
  orderId: string,
  updateData: { paymentId?: string; orderStatus: string; paymentStatus: string }
) => {
  console.log("Updating payment status for orderId:", orderId);
  console.log("Update data:", updateData);

  const updatedPayment = await PaymentModel.findOneAndUpdate(
    { orderId },
    { $set: updateData },
    { new: true }
  );

  console.log("Updated payment record:", updatedPayment);
  return updatedPayment;
};

export const getAllPayments = async () => {
  return await PaymentModel.find().exec();
};

export const getPaymentsByDateRange = async (
  startDate: Date,
  endDate: Date
) => {
  return await PaymentModel.find({
    orderDate: {
      $gte: startDate,
      $lte: endDate,
    },
  }).exec();
};
