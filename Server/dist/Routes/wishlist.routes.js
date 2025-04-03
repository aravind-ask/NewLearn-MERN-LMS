"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wishlist_controller_1 = require("../Controllers/wishlist.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post("/add", auth_middleware_1.authMiddleware.verifyAccessToken, wishlist_controller_1.addToWishlist);
router.delete("/remove", auth_middleware_1.authMiddleware.verifyAccessToken, wishlist_controller_1.removeFromWishlist);
router.get("/", auth_middleware_1.authMiddleware.verifyAccessToken, wishlist_controller_1.getWishlist);
exports.default = router;
