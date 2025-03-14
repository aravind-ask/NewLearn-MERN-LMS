import { Request, Response, NextFunction } from "express";
import { tokenUtils } from "../utils/tokenUtils";
import { errorResponse } from "../utils/responseHandler";
import { HttpStatus } from "../utils/statusCodes";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export const authMiddleware = {
  async verifyAccessToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        errorResponse(
          res,
          "Access token missing or malformed",
          HttpStatus.UNAUTHORIZED
        );
        return;
      }

      const token = authHeader.split(" ")[1];
      const decoded = tokenUtils.verifyAccessToken(token);
      console.log("decoded", decoded);
      req.user = { id: decoded.userId, role: decoded.role };
      next();
    } catch (error) {
      console.error("Error verifying access token:", error);
      errorResponse(
        res,
        "Invalid or expired access token",
        HttpStatus.UNAUTHORIZED
      );
    }
  },
};
