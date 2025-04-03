"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartModel = void 0;
const mongoose_1 = require("mongoose");
const cartSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    items: [
        {
            course: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Course" },
            offer: {
                type: {
                    _id: { type: String, required: true },
                    title: { type: String, required: true },
                    description: { type: String, required: true },
                    discountPercentage: { type: Number, required: true },
                },
                required: false,
                default: null,
            },
        },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
exports.CartModel = (0, mongoose_1.model)("Cart", cartSchema);
