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
exports.InterviewRepository = void 0;
const UserAnswer_1 = require("../models/UserAnswer");
const Interview_1 = require("../models/Interview");
class InterviewRepository {
    create(interview) {
        return __awaiter(this, void 0, void 0, function* () {
            const newInterview = yield Interview_1.InterviewModel.create(interview);
            return newInterview.toObject();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const interview = yield Interview_1.InterviewModel.findById(id).lean();
            return interview;
        });
    }
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const interviews = yield Interview_1.InterviewModel.find({ userId }).lean();
            return interviews;
        });
    }
    update(id, interview) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedInterview = yield Interview_1.InterviewModel.findByIdAndUpdate(id, Object.assign(Object.assign({}, interview), { updatedAt: new Date() }), { new: true, runValidators: true }).lean();
            return updatedInterview;
        });
    }
    createUserAnswer(userAnswer) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUserAnswer = yield UserAnswer_1.UserAnswerModel.create(userAnswer);
            return newUserAnswer.toObject();
        });
    }
    findByUserAndQuestion(userId, question, mockIdRef) {
        return __awaiter(this, void 0, void 0, function* () {
            const userAnswer = yield UserAnswer_1.UserAnswerModel.findOne({
                userId,
                question,
                mockIdRef,
            }).lean();
            return userAnswer;
        });
    }
    findByUserAndInterview(userId, mockIdRef) {
        return __awaiter(this, void 0, void 0, function* () {
            const userAnswers = yield UserAnswer_1.UserAnswerModel.find({
                userId,
                mockIdRef,
            }).lean();
            return userAnswers;
        });
    }
}
exports.InterviewRepository = InterviewRepository;
