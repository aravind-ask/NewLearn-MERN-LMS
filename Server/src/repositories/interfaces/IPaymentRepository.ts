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
  getAllPayments(): Promise<IPayment[]>;
  getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<IPayment[]>;
}
