import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { successResponse, errorResponse } from "../utils/responseHandler";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);
      const { name, email, password } = req.body;
      const user = await authService.register(name, email, password);
      successResponse(res, user, "otp send successfully", 201);
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ message: error.message });
    }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const data = await authService.verifyOtp(email, otp);
      res.status(200).json(data);
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ message: error.message });
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      successResponse(res, data, "login successfully", 200);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },

  async googleAuth(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const data = await authService.authenticateGoogleUser(token);

      res.json({
        success: true,
        message: "Google Login Successful",
        data,
      });
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const token = await authService.refreshAccessToken(refreshToken);
      res.status(200).json(token);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const result = await authService.logout(userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};
