import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { successResponse, errorResponse } from "../utils/responseHandler";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);
      const { name, email, password } = req.body;
      const user = await authService.register(name, email, password);
      successResponse(res, user, "otp send successfully", 201);
    } catch (error: any) {
      console.log(error);
      errorResponse(res, error, error.statusCode || 400);
    }
  },

  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const data = await authService.sendOtp(email);
      successResponse(res, data, "otp send successfully", 200);
    } catch (error: any) {
      console.log(error);
      errorResponse(res, error, error.statusCode || 400);
    }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const data = await authService.verifyOtp(email, otp);
      successResponse(res, data, "otp verified successfully", 200);
    } catch (error: any) {
      console.log(error);
      errorResponse(res, error, error.statusCode || 400);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      successResponse(res, data, "login successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.statusCode || 400);
    }
  },

  async googleAuth(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const data = await authService.authenticateGoogleUser(token);

      successResponse(res, data, "Google Login Successful", 200);
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      errorResponse(res, error, error.statusCode || 500);
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshAccessToken(refreshToken);
      successResponse(res, tokens, "Token Refreshed Successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.statusCode || 401);
    }
  },

  async resetPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { curPassword, newPassword } = req.body;
      if (!req.user) {
        errorResponse(res, "Unauthorized", 401);
        return;
      }
      const userId = req.user.id;
      const result = await authService.changePassword({
        userId: userId,
        curPassword: curPassword,
        newPassword: newPassword,
      });
      successResponse(res, null, "Password Changed Successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.statusCode || 400);
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await authService.changePassword({
        email: email,
        otp: otp,
        newPassword: newPassword,
      });
      successResponse(res, result, "Password Changed Successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.statusCode || 400);
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const result = await authService.logout(userId);
      successResponse(res, result, "Logged out successfully", 200);
    } catch (error: any) {
      errorResponse(res, error, error.statusCode || 400);
    }
  },
};
