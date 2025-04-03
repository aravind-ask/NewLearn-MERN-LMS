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
exports.CartController = void 0;
const mongoose_1 = require("mongoose");
const responseHandler_1 = require("../utils/responseHandler");
const statusCodes_1 = require("../utils/statusCodes");
class CartController {
    constructor(cartService) {
        this.cartService = cartService;
    }
    addToCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const cartItem = {
                    course: new mongoose_1.Types.ObjectId(req.body.courseId),
                    offer: req.body.offer
                        ? {
                            _id: req.body.offer._id,
                            title: req.body.offer.title,
                            description: req.body.offer.description,
                            discountPercentage: req.body.offer.discountPercentage,
                        }
                        : null,
                };
                const cart = yield this.cartService.addToCart(userId, cartItem);
                (0, responseHandler_1.successResponse)(res, cart, "Course added to cart", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                const err = error;
                (0, responseHandler_1.errorResponse)(res, "Internal Server Error", statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    removeFromCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { courseId } = req.params;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const cart = yield this.cartService.removeFromCart(userId, courseId);
                (0, responseHandler_1.successResponse)(res, cart, "Course removed from cart", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                const err = error;
                (0, responseHandler_1.errorResponse)(res, "Internal Server Error", statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const cart = yield this.cartService.getCart(userId);
                (0, responseHandler_1.successResponse)(res, cart || { userId: new mongoose_1.Types.ObjectId(userId), items: [] }, "Cart retrieved", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                const err = error;
                (0, responseHandler_1.errorResponse)(res, "Internal Server Error", statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.CartController = CartController;
