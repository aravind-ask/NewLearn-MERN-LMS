import express from "express";
import {
  addToCart,
  removeFromCart,
  getCart,
} from "../Controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/add", authMiddleware.verifyAccessToken, addToCart);
router.delete("/remove", authMiddleware.verifyAccessToken, removeFromCart);
router.get("/", authMiddleware.verifyAccessToken, getCart);

export default router;
