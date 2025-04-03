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
exports.authMiddleware = void 0;
const tokenUtils_1 = require("../utils/tokenUtils");
const responseHandler_1 = require("../utils/responseHandler");
const statusCodes_1 = require("../utils/statusCodes");
exports.authMiddleware = {
    verifyAccessToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    (0, responseHandler_1.errorResponse)(res, "Access token missing or malformed", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const token = authHeader.split(" ")[1];
                const decoded = tokenUtils_1.tokenUtils.verifyAccessToken(token);
                console.log("decoded", decoded);
                req.user = { id: decoded.userId, role: decoded.role };
                next();
            }
            catch (error) {
                console.error("Error verifying access token:", error);
                (0, responseHandler_1.errorResponse)(res, "Invalid or expired access token", statusCodes_1.HttpStatus.UNAUTHORIZED);
            }
        });
    },
};
