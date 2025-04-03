"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/paymentModel.ts
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    orderStatus: { type: String, default: "pending" },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, default: "pending" },
    orderDate: { type: Date, default: Date.now },
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true },
    courses: [
        {
            courseId: { type: String, required: true },
            courseTitle: { type: String, required: true },
            courseImage: { type: String, required: true },
            coursePrice: { type: Number, required: true },
            instructorId: { type: String, required: true },
            instructorName: { type: String, required: true },
        },
    ],
    amount: { type: Number, required: true },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Payment", paymentSchema);
