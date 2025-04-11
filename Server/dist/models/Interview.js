"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewModel = void 0;
// interview.model.ts
const mongoose_1 = require("mongoose");
const interviewSchema = new mongoose_1.Schema({
    position: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true },
    experience: { type: Number, required: true, min: 0 },
    userId: { type: String, required: true },
    techStack: { type: String, required: true },
    questions: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true },
        },
    ],
    videoUrl: { type: String },
}, {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});
exports.InterviewModel = (0, mongoose_1.model)("Interview", interviewSchema);
