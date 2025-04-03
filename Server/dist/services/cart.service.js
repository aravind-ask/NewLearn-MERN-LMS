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
exports.CartService = void 0;
const mongoose_1 = require("mongoose");
class CartService {
    constructor(cartRepository) {
        this.cartRepository = cartRepository;
    }
    addToCart(userId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            // Basic validation
            if (!mongoose_1.Types.ObjectId.isValid(userId) ||
                !mongoose_1.Types.ObjectId.isValid(item.course.toString())) {
                throw new Error("Invalid ID format");
            }
            if (item.offer &&
                (!item.offer._id ||
                    !item.offer.title ||
                    !item.offer.description ||
                    item.offer.discountPercentage === undefined)) {
                throw new Error("Invalid offer format");
            }
            return this.cartRepository.addItem(userId, item);
        });
    }
    removeFromCart(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(courseId)) {
                throw new Error("Invalid ID format");
            }
            return this.cartRepository.removeItem(userId, courseId);
        });
    }
    getCart(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new Error("Invalid user ID");
            }
            return this.cartRepository.findByUserId(userId);
        });
    }
}
exports.CartService = CartService;
