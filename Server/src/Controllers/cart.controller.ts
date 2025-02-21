import { Request, Response, NextFunction } from "express";
import * as cartService from "../services/cart.service";
import { successResponse } from "../utils/responseHandler";

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.body;
    const userId = (req as AuthenticatedRequest).user.id;
    const cartItem = await cartService.addToCart(userId, courseId);
    successResponse(res, cartItem, "Course added to cart", 201);
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.body;
    const userId = (req as AuthenticatedRequest).user.id;
    await cartService.removeFromCart(userId, courseId);
    successResponse(res, null, "Course removed from cart", 200);
  } catch (error) {
    next(error);
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const cart = await cartService.getCart(userId);
    successResponse(res, cart, "Cart fetched successfully", 200);
  } catch (error) {
    next(error);
  }
};
