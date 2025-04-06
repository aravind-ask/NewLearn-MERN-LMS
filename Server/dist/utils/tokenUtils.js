"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
exports.tokenUtils = {
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "60m" });
    },
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    },
    verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
    },
    verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
    },
};
