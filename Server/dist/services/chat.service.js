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
exports.ChatService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const customError_1 = require("../utils/customError");
class ChatService {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }
    sendMessage(messageData) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageDataWithObjectId = {
                courseId: new mongoose_1.default.Types.ObjectId(messageData.courseId),
                senderId: messageData.senderId
                    ? new mongoose_1.default.Types.ObjectId(messageData.senderId)
                    : undefined,
                recipientId: new mongoose_1.default.Types.ObjectId(messageData.recipientId),
                message: messageData.message,
                mediaUrl: messageData.mediaUrl,
            };
            return yield this.chatRepository.saveMessage(messageDataWithObjectId);
        });
    }
    editMessage(messageId, senderId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.chatRepository.getMessageById(messageId);
            if (!message || message.senderId.toString() !== senderId) {
                throw new customError_1.UnauthorizedError("You can only edit your own messages");
            }
            return yield this.chatRepository.updateMessage(messageId, Object.assign(Object.assign({}, updates), { isEdited: true }));
        });
    }
    deleteMessage(messageId, senderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = yield this.chatRepository.getMessageById(messageId);
            if (!message || message.senderId.toString() !== senderId) {
                throw new customError_1.UnauthorizedError("You can only delete your own messages");
            }
            return yield this.chatRepository.updateMessage(messageId, {
                isDeleted: true,
            });
        });
    }
    getConversation(courseId, userId, trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatRepository.getMessages(courseId, userId, trainerId);
        });
    }
    markMessageAsRead(messageId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatRepository.markAsRead(messageId);
        });
    }
    getAllConversationsForTrainer(trainerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.chatRepository.getAllMessagesForTrainer(trainerId);
        });
    }
}
exports.ChatService = ChatService;
