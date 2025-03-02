// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { successResponse, errorResponse } from "../utils/responseHandler";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const user = await this.authService.register(name, email, password);
      successResponse(res, user, "OTP sent successfully", 201);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const data = await this.authService.sendOtp(email);
      successResponse(res, data, "OTP sent successfully", 200);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const data = await this.authService.verifyOtp(email, otp);
      successResponse(res, data, "OTP verified successfully", 200);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await this.authService.login(email, password);
      successResponse(res, data, "Login successful", 200);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const data = await this.authService.authenticateGoogleUser(token);
      successResponse(res, data, "Google Login Successful", 200);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshAccessToken(refreshToken);
      successResponse(res, tokens, "Token refreshed successfully", 200);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 401);
    }
  }

  async resetPassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { curPassword, newPassword } = req.body;
      if (!req.user) {
        errorResponse(res, "Unauthorized", 401);
        return;
      }
      const result = await this.authService.changePassword({
        userId: req.user.id,
        curPassword,
        newPassword,
      });
      successResponse(res, null, "Password changed successfully", 200);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await this.authService.changePassword({
        email,
        otp,
        newPassword,
      });
      successResponse(res, result, "Password changed successfully", 200);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const result = await this.authService.logout(userId);
      successResponse(res, result, "Logged out successfully", 200);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }
}
