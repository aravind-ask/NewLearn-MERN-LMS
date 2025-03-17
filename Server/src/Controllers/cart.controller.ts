// src/controllers/cart.controller.ts
import { Request, Response } from "express";
import { CartService } from "../services/cart.service";
import { ICartItem } from "../models/Cart";
import { Types } from "mongoose";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { HttpStatus } from "../utils/statusCodes";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class CartController {
  constructor(private cartService: CartService) {}

  async addToCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
        return;
      }

      const cartItem: ICartItem = {
        course: new Types.ObjectId(req.body.courseId) as Types.ObjectId,
        offer: req.body.offer
          ? {
              _id: req.body.offer._id,
              title: req.body.offer.title,
              description: req.body.offer.description,
              discountPercentage: req.body.offer.discountPercentage,
            }
          : null,
      };

      const cart = await this.cartService.addToCart(userId, cartItem);
      successResponse(res, cart, "Course added to cart", HttpStatus.OK);
    } catch (error) {
      const err = error as Error;
      errorResponse(
        res,
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async removeFromCart(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const { courseId } = req.params;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const cart = await this.cartService.removeFromCart(userId, courseId);
      successResponse(res, cart, "Course removed from cart", HttpStatus.OK);
    } catch (error) {
      const err = error as Error;
      errorResponse(
        res,
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCart(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const cart = await this.cartService.getCart(userId);
      successResponse(
        res,
        cart || { userId: new Types.ObjectId(userId), items: [] },
        "Cart retrieved",
        HttpStatus.OK
      );
    } catch (error) {
      const err = error as Error;
      errorResponse(
        res,
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
