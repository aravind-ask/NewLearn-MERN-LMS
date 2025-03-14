import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { HttpStatus } from "../utils/statusCodes";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const user = await this.authService.register(name, email, password);
      successResponse(res, user, "OTP sent successfully", HttpStatus.CREATED);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const data = await this.authService.sendOtp(email);
      successResponse(res, data, "OTP sent successfully", HttpStatus.OK);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const data = await this.authService.verifyOtp(email, otp);
      successResponse(res, data, "OTP verified successfully", HttpStatus.OK);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await this.authService.login(email, password);
      successResponse(res, data, "Login successful", HttpStatus.OK);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const data = await this.authService.authenticateGoogleUser(token);
      successResponse(res, data, "Google Login Successful", HttpStatus.OK);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refreshAccessToken(refreshToken);
      successResponse(res, tokens, "Token refreshed successfully", HttpStatus.OK);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || HttpStatus.UNAUTHORIZED);
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
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
        return;
      }
      const result = await this.authService.changePassword({
        userId: req.user.id,
        curPassword,
        newPassword,
      });
      successResponse(res, null, "Password changed successfully", HttpStatus.OK);
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
      successResponse(res, result, "Password changed successfully", HttpStatus.OK);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const result = await this.authService.logout(userId);
      successResponse(res, result, "Logged out successfully", HttpStatus.OK);
    } catch (error: any) {
      errorResponse(res, error.message, error.statusCode || 400);
    }
  }
}
