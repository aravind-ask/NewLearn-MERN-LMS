"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAnswerModel = void 0;
const mongoose_1 = require("mongoose");
const userAnswerSchema = new mongoose_1.Schema({
    mockIdRef: { type: String, required: true },
    question: { type: String, required: true },
    correct_ans: { type: String, required: true },
    user_ans: { type: String, required: true },
    feedback: { type: String, required: true },
    rating: { type: Number, required: true },
    userId: { type: String, required: true },
}, {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});
exports.UserAnswerModel = (0, mongoose_1.model)("UserAnswer", userAnswerSchema);
