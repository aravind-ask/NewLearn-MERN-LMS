// --- middlewares/auth.middleware.ts ---
import { Request, Response, NextFunction } from "express";
import { tokenUtils } from "../utils/tokenUtils";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const authMiddleware = {
  async verifyAccessToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log("req.headers", req.headers);
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Access token missing or malformed" });
        return;
      }

      const token = authHeader.split(" ")[1];
      const decoded = tokenUtils.verifyAccessToken(token);
      console.log("decoded", decoded);

      req.user = { id: decoded.userId };
      next();
    } catch (error) {
      console.error("Error verifying access token:", error);
      res.status(400).json({ message: "Invalid or expired access token" });
    }
  },
};
