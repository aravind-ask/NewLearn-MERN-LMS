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
exports.getWishlist = exports.removeFromWishlist = exports.addToWishlist = void 0;
const Wishlist_1 = require("../models/Wishlist");
const addToWishlist = (userId, courseId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingWishlistItem = yield Wishlist_1.Wishlist.findOne({ userId, courseId });
    if (existingWishlistItem) {
        throw new Error("Course already in wishlist");
    }
    const wishlistItem = new Wishlist_1.Wishlist({ userId, courseId });
    yield wishlistItem.save();
    const populatedWishlistItem = yield Wishlist_1.Wishlist.findById(wishlistItem._id)
        .populate("courseId")
        .exec();
    return populatedWishlistItem.courseId;
});
exports.addToWishlist = addToWishlist;
const removeFromWishlist = (userId, courseId) => __awaiter(void 0, void 0, void 0, function* () {
    yield Wishlist_1.Wishlist.findOneAndDelete({ userId, courseId });
});
exports.removeFromWishlist = removeFromWishlist;
const getWishlist = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wishlistItems = yield Wishlist_1.Wishlist.find({ userId }).populate("courseId");
    return wishlistItems.map((item) => item.courseId);
});
exports.getWishlist = getWishlist;
