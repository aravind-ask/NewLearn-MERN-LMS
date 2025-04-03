"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/cart.routes.ts
const express_1 = require("express");
const cart_controller_1 = require("../Controllers/cart.controller");
const cart_service_1 = require("../services/cart.service");
const cart_repository_1 = require("../repositories/cart.repository");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const cartRepository = new cart_repository_1.CartRepository();
const cartService = new cart_service_1.CartService(cartRepository);
const cartController = new cart_controller_1.CartController(cartService);
router.post("/", auth_middleware_1.authMiddleware.verifyAccessToken, cartController.addToCart.bind(cartController));
router.delete("/:courseId", auth_middleware_1.authMiddleware.verifyAccessToken, cartController.removeFromCart.bind(cartController));
router.get("/", auth_middleware_1.authMiddleware.verifyAccessToken, cartController.getCart.bind(cartController));
exports.default = router;
