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
// src/repositories/PaymentRepository.ts
const Payment_1 = __importDefault(require("../models/Payment"));
const base_repository_1 = require("./base.repository");
class PaymentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Payment_1.default);
    }
    createPayment(paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.create(Object.assign(Object.assign({}, paymentData), { paymentId: "pending", payerId: "pending", paymentStatus: "pending", orderStatus: "pending" }));
            }
            catch (error) {
                console.error("Error creating payment:", error);
                throw new Error("Error creating payment");
            }
        });
    }
    updatePaymentStatus(orderId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model
                    .findOneAndUpdate({ orderId }, { $set: updateData }, { new: true })
                    .exec();
            }
            catch (error) {
                console.error("Error updating payment status:", error);
                throw new Error("Error updating payment status");
            }
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model.findOne({ orderId: id }).exec();
            }
            catch (error) {
                console.error(`Error finding payment by orderId ${id}:`, error);
                throw new Error(`Error finding payment by orderId ${id}`);
            }
        });
    }
    getAllPayments() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model.find().exec();
            }
            catch (error) {
                console.error("Error fetching all payments:", error);
                throw new Error("Error fetching all payments");
            }
        });
    }
    getPaymentsByDateRange(startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model
                    .find({
                    orderDate: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                })
                    .exec();
            }
            catch (error) {
                console.error("Error fetching payments by date range:", error);
                throw new Error("Error fetching payments by date range");
            }
        });
    }
    getUserPaymentHistory(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const [payments, totalPayments] = yield Promise.all([
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
            }
            catch (error) {
                console.error("Error fetching user payment history:", error);
                throw new Error("Error fetching user payment history");
            }
        });
    }
}
exports.PaymentRepository = PaymentRepository;
