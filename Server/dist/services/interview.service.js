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
exports.InterviewService = void 0;
class InterviewService {
    constructor(interviewRepository) {
        this.interviewRepository = interviewRepository;
    }
    createInterview(interview) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interview.userId) {
                throw new Error("User ID is required");
            }
            return this.interviewRepository.create(interview);
        });
    }
    getInterview(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const interview = yield this.interviewRepository.findById(id);
            if (!interview) {
                throw new Error("Interview not found");
            }
            return interview;
        });
    }
    getInterviewsByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const interviews = yield this.interviewRepository.findByUserId(userId);
            return interviews;
        });
    }
    updateInterview(id, interview) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedInterview = yield this.interviewRepository.update(id, interview);
            if (!updatedInterview) {
                throw new Error("Interview not found");
            }
            return updatedInterview;
        });
    }
    createUserAnswer(userAnswer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userAnswer.userId || !userAnswer.mockIdRef) {
                throw new Error("User ID and Mock ID are required");
            }
            return this.interviewRepository.createUserAnswer(userAnswer);
        });
    }
    getUserAnswer(userId, question, mockIdRef) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.interviewRepository.findByUserAndQuestion(userId, question, mockIdRef);
        });
    }
    getUserAnswersByInterview(userId, mockIdRef) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.interviewRepository.findByUserAndInterview(userId, mockIdRef);
        });
    }
}
exports.InterviewService = InterviewService;
