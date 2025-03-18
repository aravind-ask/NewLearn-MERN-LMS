import { Request, Response, NextFunction } from "express";
import * as wishlistService from "../services/wishlist.service";
import { successResponse } from "../utils/responseHandler";
import { HttpStatus } from "../utils/statusCodes";

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
    successResponse(res, wishlistItem, "Course added to wishlist", HttpStatus.CREATED);
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
    successResponse(res, null, "Course removed from wishlist", HttpStatus.OK);
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
    successResponse(res, wishlist, "Wishlist fetched successfully", HttpStatus.OK);
  } catch (error) {
    next(error);
  }
};
