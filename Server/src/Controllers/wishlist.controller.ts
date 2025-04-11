// src/controllers/WishlistController.ts
import { Request, Response } from "express";
import { IWishlistService } from "../services/interfaces/IWishlistService";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { HttpStatus } from "../utils/statusCodes";
import { Types } from "mongoose";
import { Course } from "../types/types";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class WishlistController {
  constructor(private wishlistService: IWishlistService) {}

  async addToWishlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { courseId } = req.body;

      if (!userId) {
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
        return;
      }

      const wishlistItem = await this.wishlistService.addToWishlist(
        userId,
        courseId
      );
      successResponse(
        res,
        wishlistItem,
        "Course added to wishlist",
        HttpStatus.CREATED
      );
    } catch (error) {
      const err = error as Error;
      errorResponse(
        res,
        err.message || "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async removeFromWishlist(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const { courseId } = req.body;

      if (!userId) {
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
        return;
      }

      await this.wishlistService.removeFromWishlist(userId, courseId);
      successResponse(res, null, "Course removed from wishlist", HttpStatus.OK);
    } catch (error) {
      const err = error as Error;
      errorResponse(
        res,
        err.message || "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getWishlist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
        return;
      }

      const wishlist = await this.wishlistService.getWishlist(userId);
      successResponse(res, wishlist || [], "Wishlist retrieved", HttpStatus.OK);
    } catch (error) {
      const err = error as Error;
      errorResponse(
        res,
        err.message || "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default WishlistController;
