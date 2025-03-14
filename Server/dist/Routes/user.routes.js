"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../Controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post("/upload-url", auth_middleware_1.authMiddleware, user_controller_1.getUploadUrl);
router.put("/update-profile", auth_middleware_1.authMiddleware, user_controller_1.updateProfile);
exports.default = router;
