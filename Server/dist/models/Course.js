"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
// src/models/Course.ts
const mongoose_1 = __importStar(require("mongoose"));
const LectureSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    public_id: { type: String, required: true },
    freePreview: { type: Boolean, required: true },
});
const SectionSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    lectures: [LectureSchema],
});
const CourseSchema = new mongoose_1.Schema({
    instructorId: { type: String, required: true },
    instructorName: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    title: { type: String, required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    level: { type: String, required: true },
    primaryLanguage: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    pricing: { type: Number, required: true },
    offer: { type: mongoose_1.Schema.Types.ObjectId, ref: "Offer", required: false },
    objectives: { type: String, required: true },
    welcomeMessage: { type: String, required: true },
    students: [
        {
            studentId: { type: String, required: true },
            studentName: { type: String, required: true },
            studentEmail: { type: String, required: true },
            paidAmount: { type: Number, required: true },
            dateJoined: { type: Date, default: Date.now },
        },
    ],
    curriculum: [SectionSchema],
}, { timestamps: true });
exports.Course = mongoose_1.default.model("Course", CourseSchema);
