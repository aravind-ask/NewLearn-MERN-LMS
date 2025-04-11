"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/Routes/wishlist.routes.ts
const express_1 = require("express");
const wishlist_controller_1 = require("../Controllers/wishlist.controller");
const wishlist_service_1 = require("../services/wishlist.service");
const wishlist_repository_1 = require("../repositories/wishlist.repository");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const wishlistRepository = new wishlist_repository_1.WishlistRepository();
const wishlistService = new wishlist_service_1.WishlistService(wishlistRepository);
const wishlistController = new wishlist_controller_1.WishlistController(wishlistService);
router.post("/add", auth_middleware_1.authMiddleware.verifyAccessToken, wishlistController.addToWishlist.bind(wishlistController));
router.delete("/remove", auth_middleware_1.authMiddleware.verifyAccessToken, wishlistController.removeFromWishlist.bind(wishlistController));
router.get("/", auth_middleware_1.authMiddleware.verifyAccessToken, wishlistController.getWishlist.bind(wishlistController));
exports.default = router;
