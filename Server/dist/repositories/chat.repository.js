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
exports.ChatRepository = void 0;
const ChatMessage_1 = require("../models/ChatMessage");
const customError_1 = require("../utils/customError");
const mongoose_1 = __importDefault(require("mongoose"));
class ChatRepository {
    saveMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = new ChatMessage_1.ChatMessage(message);
            return yield newMessage.save();
        });
    }
    getMessageById(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ChatMessage_1.ChatMessage.findById(messageId).exec();
        });
    }
    updateMessage(messageId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield ChatMessage_1.ChatMessage.findByIdAndUpdate(messageId, { $set: updates }, { new: true }).exec();
            if (!message)
                throw new customError_1.NotFoundError("Message not found");
            return message;
        });
    }
    deleteMessage(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield ChatMessage_1.ChatMessage.findByIdAndDelete(messageId).exec();
            if (!message)
                throw new customError_1.NotFoundError("Message not found");
            return message;
        });
    }
    getMessages(courseId, userId, trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ChatMessage_1.ChatMessage.find({
                courseId: new mongoose_1.default.Types.ObjectId(courseId),
                $or: [
                    {
                        senderId: userId ? new mongoose_1.default.Types.ObjectId(userId) : undefined,
                        recipientId: new mongoose_1.default.Types.ObjectId(trainerId),
                    },
                    {
                        senderId: new mongoose_1.default.Types.ObjectId(trainerId),
                        recipientId: userId ? new mongoose_1.default.Types.ObjectId(userId) : undefined,
                    },
                ],
            }).sort({ timestamp: 1 });
        });
    }
    markAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield ChatMessage_1.ChatMessage.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(messageId), { isRead: true }, { new: true });
            if (!message)
                throw new customError_1.NotFoundError("Message not found");
            return message;
        });
    }
    getAllMessagesForTrainer(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ChatMessage_1.ChatMessage.find({
                $or: [{ senderId: trainerId }, { recipientId: trainerId }],
            })
                .populate("courseId", "title")
                .populate("senderId", "name")
                .populate("recipientId", "name")
                .sort({ timestamp: 1 });
        });
    }
}
exports.ChatRepository = ChatRepository;
