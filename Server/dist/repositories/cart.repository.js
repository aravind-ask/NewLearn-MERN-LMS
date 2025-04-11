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
exports.CartRepository = void 0;
// src/repositories/CartRepository.ts
const Cart_1 = require("../models/Cart");
const base_repository_1 = require("./base.repository");
const mongoose_1 = require("mongoose");
class CartRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Cart_1.CartModel);
    }
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield this.findOne({ userId: new mongoose_1.Types.ObjectId(userId) }, "items.course"));
            }
            catch (error) {
                console.error("Error finding cart by user ID:", error);
                throw new Error("Failed to find cart by user ID");
            }
        });
    }
    addItem(userId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const populatedCart = yield this.findByUserId(userId);
                let cart;
                if (!populatedCart) {
                    cart = yield this.create({
                        userId: new mongoose_1.Types.ObjectId(userId),
                        items: [],
                        updatedAt: new Date(),
                    });
                }
                else {
                    const cartDoc = yield this.model.findById(populatedCart._id).exec();
                    if (!cartDoc) {
                        throw new Error("Cart not found after fetch");
                    }
                    cart = cartDoc;
                }
                cart.items.push(item);
                cart.updatedAt = new Date();
                return yield cart.save();
            }
            catch (error) {
                console.error("Error adding item to cart:", error);
                throw new Error("Failed to add item to cart");
            }
        });
    }
    removeItem(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const populatedCart = yield this.findByUserId(userId);
                if (!populatedCart) {
                    throw new Error("Cart not found");
                }
                const cart = yield this.model.findById(populatedCart._id).exec();
                if (!cart) {
                    throw new Error("Cart not found");
                }
                cart.items = cart.items.filter((item) => !item.course.equals(new mongoose_1.Types.ObjectId(courseId)));
                cart.updatedAt = new Date();
                return yield cart.save();
            }
            catch (error) {
                console.error("Error removing item from cart:", error);
                throw new Error("Failed to remove item from cart");
            }
        });
    }
}
exports.CartRepository = CartRepository;
