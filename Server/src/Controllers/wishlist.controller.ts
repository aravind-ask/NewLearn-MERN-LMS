import { Request, Response, NextFunction } from "express";
import * as wishlistService from "../services/wishlist.service";
import { successResponse } from "../utils/responseHandler";

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

export const addToWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.body;
    const userId = (req as AuthenticatedRequest).user.id;
    const wishlistItem = await wishlistService.addToWishlist(userId, courseId);
    successResponse(res, wishlistItem, "Course added to wishlist", 201);
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.body;
    const userId = (req as AuthenticatedRequest).user.id;
    await wishlistService.removeFromWishlist(userId, courseId);
    successResponse(res, null, "Course removed from wishlist", 200);
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const wishlist = await wishlistService.getWishlist(userId);
    successResponse(res, wishlist, "Wishlist fetched successfully", 200);
  } catch (error) {
    next(error);
  }
};
