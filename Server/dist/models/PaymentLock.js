"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentLock = void 0;
// src/models/PaymentLock.ts
const mongoose_1 = require("mongoose");
const paymentLockSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 },
});
paymentLockSchema.index({ userId: 1, courseId: 1 }, { unique: true });
exports.PaymentLock = (0, mongoose_1.model)("PaymentLock", paymentLockSchema);
