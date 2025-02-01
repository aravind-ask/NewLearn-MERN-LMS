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
exports.updateProfile = exports.getUploadUrl = void 0;
const user_service_1 = __importDefault(require("../services/user.service"));
const s3_config_1 = require("../config/s3.config");
const getUploadUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileName } = req.body;
        const url = yield (0, s3_config_1.getPresignedUrl)(fileName);
        res.json({
            url,
            key: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profile-pics/${fileName}`,
        });
    }
    catch (error) {
        console.error("S3 URL Error:", error);
        res.status(500).json({ message: "Error generating upload URL" });
    }
});
exports.getUploadUrl = getUploadUrl;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { name, email, password, profilePic } = req.body;
        const updatedUser = yield user_service_1.default.updateProfile(req.user.id, name, email, password, profilePic);
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "Profile updated successfully!", user: updatedUser });
    }
    catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Profile update failed" });
    }
});
exports.updateProfile = updateProfile;
