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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewController = void 0;
class InterviewController {
    constructor(interviewService) {
        this.interviewService = interviewService;
    }
    createInterview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const interviewData = req.body;
                const newInterview = yield this.interviewService.createInterview(interviewData);
                res.status(201).json(newInterview);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    getInterview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const interview = yield this.interviewService.getInterview(id);
                res.status(200).json(interview);
            }
            catch (error) {
                res.status(404).json({ message: error.message });
            }
        });
    }
    getUserInterviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId || typeof userId !== "string") {
                    res.status(400).json({ message: "userId is required" });
                }
                const interviews = yield this.interviewService.getInterviewsByUser(userId);
                res.status(200).json(interviews);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    updateInterview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const interviewData = req.body;
                const updatedInterview = yield this.interviewService.updateInterview(id, interviewData);
                res.status(200).json(updatedInterview);
            }
            catch (error) {
                res.status(404).json({ message: error.message });
            }
        });
    }
    createUserAnswer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userAnswerData = req.body;
                const newUserAnswer = yield this.interviewService.createUserAnswer(userAnswerData);
                res.status(201).json(newUserAnswer);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    getUserAnswer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("get answer working");
                const { userId, question, mockIdRef } = req.query;
                console.log("Query params:", { userId, question, mockIdRef });
                if (!userId ||
                    typeof userId !== "string" ||
                    !mockIdRef ||
                    typeof mockIdRef !== "string") {
                    throw new Error("userId and mockIdRef are required as strings");
                }
                if (question && typeof question === "string") {
                    // Fetch a single user answer if question is provided
                    const userAnswer = yield this.interviewService.getUserAnswer(userId, question, mockIdRef);
                    console.log("Single user answer:", userAnswer);
                    res.status(200).json(userAnswer);
                }
                else {
                    // Fetch all user answers for the interview if no question is provided
                    const userAnswers = yield this.interviewService.getUserAnswersByInterview(userId, mockIdRef);
                    console.log("All user answers:", userAnswers);
                    res.status(200).json(userAnswers);
                }
            }
            catch (error) {
                console.log("Error in getUserAnswer:", error);
                res.status(404).json({ message: error.message });
            }
        });
    }
}
exports.InterviewController = InterviewController;
