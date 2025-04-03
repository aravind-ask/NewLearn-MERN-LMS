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
const Notification_1 = __importDefault(require("../models/Notification"));
class NotificationService {
    createNotification(userId, type, title, message, relatedId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = new Notification_1.default({
                userId,
                type,
                title,
                message,
                relatedId,
            });
            return yield notification.save();
        });
    }
    getUserNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Notification_1.default.find({ userId }).sort({ createdAt: -1 });
        });
    }
    markNotificationAsRead(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield Notification_1.default.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
            if (!notification)
                throw new Error("Notification not found");
            return notification;
        });
    }
}
exports.default = new NotificationService();
