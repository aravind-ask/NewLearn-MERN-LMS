// --- middlewares/authMiddleware.ts ---
import { Request, Response, NextFunction } from "express";
import { tokenUtils } from "@/utils/tokenUtils";

export const authMiddleware = {
  async verifyAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ message: "Access token missing or malformed" });
      }

      const token = authHeader.split(" ")[1]; // Extract the token
      const decoded = tokenUtils.verifyAccessToken(token); // Verify the token

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid or expired access token" });
    }
  },
};
