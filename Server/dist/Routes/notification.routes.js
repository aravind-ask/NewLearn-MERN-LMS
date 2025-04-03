"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_controller_1 = __importDefault(require("../Controllers/notification.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.get("/", auth_middleware_1.authMiddleware.verifyAccessToken, notification_controller_1.default.getNotifications);
router.put("/:notificationId/read", auth_middleware_1.authMiddleware.verifyAccessToken, notification_controller_1.default.markAsRead);
exports.default = router;
