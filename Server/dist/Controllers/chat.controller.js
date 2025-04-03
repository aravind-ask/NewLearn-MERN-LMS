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
exports.ChatController = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const customError_1 = require("../utils/customError");
class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { courseId, recipientId, message, mediaUrl } = req.body;
                const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!courseId || !recipientId) {
                    throw new customError_1.BadRequestError("Missing required fields");
                }
                const newMessage = yield this.chatService.sendMessage({
                    courseId,
                    senderId,
                    recipientId,
                    message,
                    mediaUrl,
                });
                (0, responseHandler_1.successResponse)(res, newMessage, "Message sent successfully");
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    editMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { messageId } = req.params;
                const { message, mediaUrl } = req.body;
                const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!messageId || (!message && !mediaUrl)) {
                    throw new customError_1.BadRequestError("Message ID and at least one field (message or mediaUrl) are required");
                }
                const updatedMessage = yield this.chatService.editMessage(messageId, senderId, { message, mediaUrl });
                const io = req.app.get("io");
                io.to(`chat_${updatedMessage.courseId}_${updatedMessage.senderId}`).emit("messageEdited", updatedMessage);
                io.to(`chat_${updatedMessage.courseId}_${updatedMessage.recipientId}`).emit("messageEdited", updatedMessage);
                (0, responseHandler_1.successResponse)(res, updatedMessage, "Message updated successfully");
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    deleteMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { messageId } = req.params;
                const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!messageId) {
                    throw new customError_1.BadRequestError("Message ID is required");
                }
                const deletedMessage = yield this.chatService.deleteMessage(messageId, senderId);
                const io = req.app.get("io");
                io.to(`chat_${deletedMessage.courseId}_${deletedMessage.senderId}`).emit("messageDeleted", deletedMessage);
                io.to(`chat_${deletedMessage.courseId}_${deletedMessage.recipientId}`).emit("messageDeleted", deletedMessage);
                (0, responseHandler_1.successResponse)(res, deletedMessage, "Message marked as deleted");
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    getConversation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { courseId, trainerId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!courseId || !trainerId) {
                    throw new customError_1.BadRequestError("Missing required parameters");
                }
                const messages = yield this.chatService.getConversation(courseId, userId, trainerId);
                (0, responseHandler_1.successResponse)(res, messages, "Conversation retrieved successfully");
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    getAllInstructorConversations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const trainerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!trainerId)
                    throw new customError_1.BadRequestError("Trainer ID required");
                const messages = yield this.chatService.getAllConversationsForTrainer(trainerId);
                (0, responseHandler_1.successResponse)(res, messages, "All conversations retrieved successfully");
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    markMessageAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { messageId } = req.params;
                if (!messageId)
                    throw new customError_1.BadRequestError("Message ID required");
                const updatedMessage = yield this.chatService.markMessageAsRead(messageId);
                (0, responseHandler_1.successResponse)(res, updatedMessage, "Message marked as read");
                const io = req.app.get("io");
                const studentRoom = `chat_${updatedMessage.courseId}_${updatedMessage.senderId}`;
                const instructorRoom = `instructor_${updatedMessage.recipientId}`;
                io.to(studentRoom).emit("messageRead", updatedMessage);
                console.log(`Emitted messageRead to room ${studentRoom}:`, updatedMessage);
                if (updatedMessage.senderId !== updatedMessage.recipientId) {
                    io.to(instructorRoom).emit("messageRead", updatedMessage);
                    console.log(`Emitted messageRead to room ${instructorRoom}:`, updatedMessage);
                }
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
}
exports.ChatController = ChatController;
