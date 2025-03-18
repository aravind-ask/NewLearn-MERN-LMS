// src/routes/cart.routes.ts
import { Router } from "express";
import { CartController } from "../Controllers/cart.controller";
import { CartService } from "../services/cart.service";
import { CartRepository } from "../repositories/cart.repository";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router = Router();
const cartRepository = new CartRepository();
const cartService = new CartService(cartRepository);
const cartController = new CartController(cartService);

router.post(
  "/",
  authMiddleware.verifyAccessToken,
  cartController.addToCart.bind(cartController)
);
router.delete(
  "/:courseId",
  authMiddleware.verifyAccessToken,
  cartController.removeFromCart.bind(cartController)
);
router.get(
  "/",
  authMiddleware.verifyAccessToken,
  cartController.getCart.bind(cartController)
);

export default router;
