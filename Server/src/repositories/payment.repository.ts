import PaymentModel, { IPayment } from "../models/Payment";

export const createPayment = async (paymentData: Partial<IPayment>) => {
  return await PaymentModel.create({
    ...paymentData,
    paymentId: "pending",
  });
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: string
) => {
  return await PaymentModel.findByIdAndUpdate(
    paymentId,
    { status },
    { new: true }
  );
};
