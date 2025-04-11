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
exports.getPresignedDownloadUrl = exports.getPresignedUploadUrl = exports.s3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
exports.s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
// Helper function to determine ContentType based on file extension
const getContentType = (fileName) => {
    var _a;
    const extension = (_a = fileName.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    switch (extension) {
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
            return "image/*";
        case "webm":
            return "video/webm";
        case "mp4":
            return "video/mp4";
        default:
            return "application/octet-stream"; // Fallback for unknown types
    }
};
// Generate presigned URL for uploading files (PUT)
const getPresignedUploadUrl = (fileName_1, ...args_1) => __awaiter(void 0, [fileName_1, ...args_1], void 0, function* (fileName, options = {}) {
    const key = `uploads/${(0, uuid_1.v4)()}-${Date.now()}-${fileName}`;
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Expires: options.expires || 60, // Default to 60 seconds, customizable
        ContentType: getContentType(fileName), // Dynamic ContentType
    };
    const url = yield exports.s3.getSignedUrlPromise("putObject", params);
    return { url, key };
});
exports.getPresignedUploadUrl = getPresignedUploadUrl;
// Generate presigned URL for downloading files (GET)
const getPresignedDownloadUrl = (key_1, ...args_1) => __awaiter(void 0, [key_1, ...args_1], void 0, function* (key, options = {}) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Expires: options.expires || 3600, // Default to 1 hour for playback
        ResponseContentType: getContentType(key), // Ensure correct type for playback
    };
    return yield exports.s3.getSignedUrlPromise("getObject", params);
});
exports.getPresignedDownloadUrl = getPresignedDownloadUrl;
