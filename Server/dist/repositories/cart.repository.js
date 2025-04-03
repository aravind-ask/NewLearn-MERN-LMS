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
const Cart_1 = require("../models/Cart");
const mongoose_1 = require("mongoose");
class CartRepository {
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore: Temporarily bypass type checking for this call
            return Cart_1.CartModel.findOne({ userId: new mongoose_1.Types.ObjectId(userId) })
                .populate("items.course")
                .exec();
        });
    }
    addItem(userId, item) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore: Temporarily bypass type checking for this call
            let cart = (yield this.findByUserId(userId));
            if (!cart) {
                cart = yield this.create(userId);
            }
            cart.items.push(item);
            cart.updatedAt = new Date();
            return cart.save();
        });
    }
    removeItem(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore: Temporarily bypass type checking for this call
            const cart = (yield this.findByUserId(userId));
            if (!cart) {
                throw new Error("Cart not found");
            }
            cart.items = cart.items.filter((item) => !item.course.equals(new mongoose_1.Types.ObjectId(courseId)));
            cart.updatedAt = new Date();
            return cart.save();
        });
    }
    create(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cart = new Cart_1.CartModel({
                userId: new mongoose_1.Types.ObjectId(userId),
                items: [],
            });
            return cart.save();
        });
    }
}
exports.CartRepository = CartRepository;
