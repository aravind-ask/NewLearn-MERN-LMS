// src/repositories/IPaymentRepository.ts
import { IPayment } from "../../models/Payment";

export interface IPaymentRepository {
  createPayment(paymentData: Partial<IPayment>): Promise<IPayment>;
  updatePaymentStatus(
    orderId: string,
    updateData: {
      paymentId?: string;
      orderStatus: string;
      paymentStatus: string;
    }
  ): Promise<IPayment | null>;
  getAllPayments(
    page: number,
    limit: number
  ): Promise<{ payments: IPayment[]; totalPages: number }>;
  getPaymentsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number
  ): Promise<{ payments: IPayment[]; totalPages: number }>;
  getUserPaymentHistory(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ payments: IPayment[]; totalPages: number }>;
  findById(id: string): Promise<IPayment | null>;
}
