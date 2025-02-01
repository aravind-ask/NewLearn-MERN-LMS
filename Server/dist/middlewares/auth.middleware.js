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
const tokenUtils_1 = require("@/utils/tokenUtils");
exports.authMiddleware = {
    verifyAccessToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    return res
                        .status(401)
                        .json({ message: "Access token missing or malformed" });
                }
                const token = authHeader.split(" ")[1];
                const decoded = tokenUtils_1.tokenUtils.verifyAccessToken(token);
                console.log("decoded", decoded);
                req.user = decoded;
                next();
            }
            catch (error) {
                res.status(401).json({ message: "Invalid or expired access token" });
            }
        });
    },
};
