import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../Controllers/wishlist.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/add", authMiddleware.verifyAccessToken, addToWishlist);

router.delete("/remove", authMiddleware.verifyAccessToken, removeFromWishlist);

router.get("/", authMiddleware.verifyAccessToken, getWishlist);

export default router;
