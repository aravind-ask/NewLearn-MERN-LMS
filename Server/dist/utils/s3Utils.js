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
exports.uploadToS3 = exports.getPresignedUrl = exports.s3 = void 0;
// src/utils/s3Utils.ts
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
exports.s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
const getPresignedUrl = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `certificates/${(0, uuid_1.v4)()}-${Date.now()}-${fileName}`;
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Expires: 60,
    };
    const url = yield exports.s3.getSignedUrlPromise("putObject", params);
    return { url, key };
});
exports.getPresignedUrl = getPresignedUrl;
const uploadToS3 = (file, key) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: file,
    };
    yield exports.s3.upload(params).promise();
});
exports.uploadToS3 = uploadToS3;
