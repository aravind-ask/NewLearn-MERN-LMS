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
exports.NotificationController = void 0;
const notification_service_1 = __importDefault(require("../services/notification.service"));
const responseHandler_1 = require("../utils/responseHandler");
const customError_1 = require("../utils/customError");
class NotificationController {
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    throw new customError_1.UnauthorizedError("Unauthorized");
                }
                const userId = req.user.id;
                const notifications = yield notification_service_1.default.getUserNotifications(userId);
                (0, responseHandler_1.successResponse)(res, notifications, "Notifications fetched successfully");
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
    markAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { notificationId } = req.params;
                const notification = yield notification_service_1.default.markNotificationAsRead(notificationId);
                (0, responseHandler_1.successResponse)(res, notification, "Notification marked as read");
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error);
            }
        });
    }
}
exports.NotificationController = NotificationController;
exports.default = new NotificationController();
