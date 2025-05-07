import PaymentModel, { IPayment } from "../models/Payment";
import { IPaymentRepository } from "./interfaces/IPaymentRepository";
import { BaseRepository } from "./base.repository";

export class PaymentRepository
  extends BaseRepository<IPayment>
  implements IPaymentRepository
{
  constructor() {
    super(PaymentModel);
  }

  async createPayment(paymentData: Partial<IPayment>): Promise<IPayment> {
    try {
      return await this.create({
        ...paymentData,
        paymentId: "pending",
        payerId: "pending",
        paymentStatus: "pending",
        orderStatus: "pending",
      });
    } catch (error) {
      console.error("Error creating payment:", error);
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
      return await this.model
        .findOneAndUpdate({ orderId }, { $set: updateData }, { new: true })
        .exec();
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw new Error("Error updating payment status");
    }
  }

  async findById(id: string): Promise<IPayment | null> {
    try {
      return await this.model.findOne({ orderId: id }).exec();
    } catch (error) {
      console.error(`Error finding payment by orderId ${id}:`, error);
      throw new Error(`Error finding payment by orderId ${id}`);
    }
  }

  async getAllPayments(
    page: number,
    limit: number
  ): Promise<{ payments: IPayment[]; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const [payments, totalPayments] = await Promise.all([
        this.model
          .find()
          .skip(skip)
          .limit(limit)
          .sort({ orderDate: -1 })
          .exec(),
        this.model.countDocuments(),
      ]);
      const totalPages = Math.ceil(totalPayments / limit);
      return { payments, totalPages };
    } catch (error) {
      console.error("Error fetching all payments:", error);
      throw new Error("Error fetching all payments");
    }
  }

  async getPaymentsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number
  ): Promise<{ payments: IPayment[]; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const query = {
        orderDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };
      const [payments, totalPayments] = await Promise.all([
        this.model
          .find(query)
          .skip(skip)
          .limit(limit)
          .sort({ orderDate: -1 })
          .exec(),
        this.model.countDocuments(query),
      ]);
      const totalPages = Math.ceil(totalPayments / limit);
      return { payments, totalPages };
    } catch (error) {
      console.error("Error fetching payments by date range:", error);
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
      const [payments, totalPayments] = await Promise.all([
        this.model
          .find({ userId })
          .skip(skip)
          .limit(limit)
          .sort({ orderDate: -1 })
          .exec(),
        this.model.countDocuments({ userId }),
      ]);
      const totalPages = Math.ceil(totalPayments / limit);
      return { payments, totalPages };
    } catch (error) {
      console.error("Error fetching user payment history:", error);
      throw new Error("Error fetching user payment history");
    }
  }
}
