// src/repositories/payment.repository.ts
import PaymentModel, { IPayment } from "../models/Payment";
import { IPaymentRepository } from "./interfaces/IPaymentRepository";

export class PaymentRepository implements IPaymentRepository {
  async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    try {
      return await PaymentModel.create({
        ...paymentData,
        paymentId: "pending",
        payerId: "pending",
        paymentStatus: "pending",
        orderStatus: "pending",
      });
    } catch (error) {
      throw new Error("Error creating payment");
    }
  }

  async updatePaymentStatus(
    orderId: string,
    updateData: {
      paymentId?: string;
      orderStatus: string;
      paymentStatus: string;
    }
  ): Promise<IPayment | null> {
    try {
      return await PaymentModel.findOneAndUpdate(
        { orderId },
        { $set: updateData },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error("Error updating payment status");
    }
  }

  async getAllPayments(): Promise<IPayment[]> {
    try {
      return await PaymentModel.find().exec();
    } catch (error) {
      throw new Error("Error fetching all payments");
    }
  }

  async getPaymentsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<IPayment[]> {
    try {
      return await PaymentModel.find({
        orderDate: {
          $gte: startDate,
          $lte: endDate,
        },
      }).exec();
    } catch (error) {
      throw new Error("Error fetching payments by date range");
    }
  }

  async getUserPaymentHistory(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ payments: IPayment[]; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const payments = await PaymentModel.find({ userId })
        .skip(skip)
        .limit(limit)
        .sort({ orderDate: -1 })
        .exec();
      const totalPayments = await PaymentModel.countDocuments({ userId });
      const totalPages = Math.ceil(totalPayments / limit);
      return { payments, totalPages };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
