// src/Routes/wishlist.routes.ts
import { Router } from "express";
import { WishlistController } from "../Controllers/wishlist.controller";
import { WishlistService } from "../services/wishlist.service";
import { WishlistRepository } from "../repositories/wishlist.repository";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const wishlistRepository = new WishlistRepository();
const wishlistService = new WishlistService(wishlistRepository);
const wishlistController = new WishlistController(wishlistService);

router.post(
  "/add",
  authMiddleware.verifyAccessToken,
  wishlistController.addToWishlist.bind(wishlistController)
);
router.delete(
  "/remove",
  authMiddleware.verifyAccessToken,
  wishlistController.removeFromWishlist.bind(wishlistController)
);
router.get(
  "/",
  authMiddleware.verifyAccessToken,
  wishlistController.getWishlist.bind(wishlistController)
);

export default router;
