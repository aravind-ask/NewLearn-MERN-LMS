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
exports.WishlistController = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const statusCodes_1 = require("../utils/statusCodes");
class WishlistController {
    constructor(wishlistService) {
        this.wishlistService = wishlistService;
    }
    addToWishlist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { courseId } = req.body;
                if (!userId) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const wishlistItem = yield this.wishlistService.addToWishlist(userId, courseId);
                (0, responseHandler_1.successResponse)(res, wishlistItem, "Course added to wishlist", statusCodes_1.HttpStatus.CREATED);
            }
            catch (error) {
                const err = error;
                (0, responseHandler_1.errorResponse)(res, err.message || "Internal Server Error", statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    removeFromWishlist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { courseId } = req.body;
                if (!userId) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                yield this.wishlistService.removeFromWishlist(userId, courseId);
                (0, responseHandler_1.successResponse)(res, null, "Course removed from wishlist", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                const err = error;
                (0, responseHandler_1.errorResponse)(res, err.message || "Internal Server Error", statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getWishlist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const wishlist = yield this.wishlistService.getWishlist(userId);
                (0, responseHandler_1.successResponse)(res, wishlist || [], "Wishlist retrieved", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                const err = error;
                (0, responseHandler_1.errorResponse)(res, err.message || "Internal Server Error", statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.WishlistController = WishlistController;
exports.default = WishlistController;
