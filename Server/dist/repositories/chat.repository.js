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
// src/repositories/ChatRepository.ts
const ChatMessage_1 = require("../models/ChatMessage");
const customError_1 = require("../utils/customError");
const base_repository_1 = require("./base.repository");
const mongoose_1 = __importDefault(require("mongoose"));
class ChatRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(ChatMessage_1.ChatMessage);
    }
    saveMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(message);
        });
    }
    getMessageById(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findById(messageId);
        });
    }
    updateMessage(messageId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.update(messageId, updates);
            if (!message)
                throw new customError_1.NotFoundError("Message not found");
            return message;
        });
    }
    deleteMessage(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.delete(messageId);
            if (!message)
                throw new customError_1.NotFoundError("Message not found");
            return message;
        });
    }
    getMessages(courseId, userId, trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = {
                    courseId: new mongoose_1.default.Types.ObjectId(courseId),
                    $or: [
                        {
                            senderId: userId ? new mongoose_1.default.Types.ObjectId(userId) : undefined,
                            recipientId: new mongoose_1.default.Types.ObjectId(trainerId),
                        },
                        {
                            senderId: new mongoose_1.default.Types.ObjectId(trainerId),
                            recipientId: userId
                                ? new mongoose_1.default.Types.ObjectId(userId)
                                : undefined,
                        },
                    ],
                };
                return yield this.model.find(query).sort({ timestamp: 1 }).exec();
            }
            catch (error) {
                console.error("Error fetching messages:", error);
                throw new Error("Failed to fetch messages");
            }
        });
    }
    markAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.update(messageId, { isRead: true });
            if (!message)
                throw new customError_1.NotFoundError("Message not found");
            return message;
        });
    }
    getAllMessagesForTrainer(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model
                    .find({
                    $or: [
                        { senderId: new mongoose_1.default.Types.ObjectId(trainerId) },
                        { recipientId: new mongoose_1.default.Types.ObjectId(trainerId) },
                    ],
                })
                    .populate("courseId", "title")
                    .populate("senderId", "name")
                    .populate("recipientId", "name")
                    .sort({ timestamp: 1 })
                    .exec();
            }
            catch (error) {
                console.error("Error fetching all messages for trainer:", error);
                throw new Error("Failed to fetch all messages for trainer");
            }
        });
    }
}
exports.ChatRepository = ChatRepository;
