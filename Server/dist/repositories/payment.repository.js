"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
// src/repositories/payment.repository.ts
const Payment_1 = __importDefault(require("../models/Payment"));
class PaymentRepository {
    createPayment(paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Payment_1.default.create(Object.assign(Object.assign({}, paymentData), { paymentId: "pending", payerId: "pending", paymentStatus: "pending", orderStatus: "pending" }));
            }
            catch (error) {
                throw new Error("Error creating payment");
            }
        });
    }
    updatePaymentStatus(orderId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Payment_1.default.findOneAndUpdate({ orderId }, { $set: updateData }, { new: true }).exec();
            }
            catch (error) {
                throw new Error("Error updating payment status");
            }
        });
    }
    getAllPayments() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Payment_1.default.find().exec();
            }
            catch (error) {
                throw new Error("Error fetching all payments");
            }
        });
    }
    getPaymentsByDateRange(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Payment_1.default.find({
                    orderDate: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                }).exec();
            }
            catch (error) {
                throw new Error("Error fetching payments by date range");
            }
        });
    }
    getUserPaymentHistory(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const payments = yield Payment_1.default.find({ userId })
                    .skip(skip)
                    .limit(limit)
                    .exec();
                const totalPayments = yield Payment_1.default.countDocuments({ userId });
                const totalPages = Math.ceil(totalPayments / limit);
                return { payments, totalPages };
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
}
exports.PaymentRepository = PaymentRepository;
