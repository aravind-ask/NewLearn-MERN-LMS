// src/services/auth.service.ts
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IUser } from "../models/User";
import { tokenUtils } from "../utils/tokenUtils";
import { comparePassword, hashPassword } from "../utils/hashUtils";
import { sendOTPEmail } from "../utils/emailUtils";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../utils/appError";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  constructor(private userRepo: IUserRepository) {}

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<IUser> {
    const existingUser = await this.userRepo.findUserByEmail(email);
    if (existingUser) {
      if (existingUser.isVerified) {
        throw new AppError("Account already exists, Please Login!", 409);
      } else {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await this.userRepo.updateUser(existingUser._id, { otp, otpExpires });
        try {
          await sendOTPEmail(email, otp);
        } catch (error) {
          console.error("Failed to send OTP:", error);
          throw new AppError("Failed to send OTP email", 500);
        }
        return existingUser;
      }
    }
    const hashedPassword = await hashPassword(password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.userRepo.createUser({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });
    try {
      await sendOTPEmail(email, otp);
    } catch (error) {
      console.log(error);
      await this.userRepo.deleteUser(user._id);
      throw new AppError("Failed to send OTP email", 500);
    }
    return user;
  }

  async sendOtp(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findUserByEmail(email);
    if (!user) throw new AppError("User not found", 404);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await this.userRepo.updateUser(user.id, { otp, otpExpires });
    await sendOTPEmail(email, otp);
    return { message: "OTP sent successfully" };
  }

  async verifyOtp(email: string, otp: string): Promise<{ message: string }> {
    const user = await this.userRepo.findUserByEmail(email);
    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    await this.userRepo.updateUser(user.id, {
      isVerified: true,
      otp: undefined,
      otpExpires: undefined,
    });
    return { message: "Email verified successfully" };
  }

  async login(
    email: string,
    password: string
  ): Promise<{
    accessToken?: string;
    refreshToken?: string;
    user: Partial<IUser>;
    requiresVerification?: boolean;
  }> {
    const user = await this.userRepo.findUserByEmail(email);
    if (!user) throw new AppError("Invalid credentials", 400);
    if (user.isBlocked) throw new AppError("User is blocked", 403);

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw new AppError("Invalid credentials", 400);

    if (!user.isVerified) {
      // User is not verified, send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await this.userRepo.updateUser(user._id, { otp, otpExpires });

      try {
        await sendOTPEmail(email, otp);
      } catch (error) {
        console.error("Failed to send OTP:", error);
        throw new AppError("Failed to send OTP email", 500);
      }

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          photoUrl: user.photoUrl,
          bio: user.bio,
          phoneNumber: user.phoneNumber,
          address: user.address,
          dateOfBirth: user.dateOfBirth,
          education: user.education,
          isBlocked: user.isBlocked,
        },
        requiresVerification: true,
      };
    }

    const accessToken = tokenUtils.generateAccessToken({
      userId: user._id,
      role: user.role,
    });
    const refreshToken = tokenUtils.generateRefreshToken({ userId: user._id });

    await this.userRepo.updateRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        education: user.education,
        isBlocked: user.isBlocked,
      },
    };
  }

  async authenticateGoogleUser(token: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<IUser>;
  }> {
    const payload = await client
      .verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      .then((ticket) => ticket.getPayload());

    if (!payload) throw new AppError("Invalid Google Token", 401);

    const { sub, email, name, picture } = payload;
    let user = await this.userRepo.findUserByEmail(email!);
    if (!user) {
      user = await this.userRepo.createUser({
        googleId: sub,
        email,
        name,
        photoUrl: picture,
        role: "student",
        isVerified: true,
      });
    }

    if (user.isBlocked) throw new AppError("User is blocked", 403);

    const accessToken = tokenUtils.generateAccessToken({
      userId: user._id,
      role: user.role,
    });
    const refreshToken = tokenUtils.generateRefreshToken({ userId: user._id });

    await this.userRepo.updateRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
        isBlocked: user.isBlocked,
      },
    };
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = tokenUtils.verifyRefreshToken(refreshToken);
    const user = await this.userRepo.findUserById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    const accessToken = tokenUtils.generateAccessToken({
      userId: user._id,
      role: user.role,
    });
    return { accessToken, refreshToken };
  }

  async changePassword(data: {
    userId?: string;
    email?: string;
    curPassword?: string;
    newPassword: string;
    otp?: string;
  }): Promise<{ message: string }> {
    const { userId, email, curPassword, newPassword, otp } = data;
    let user;

    if (userId) {
      user = await this.userRepo.findUserById(userId);
    } else if (email) {
      user = await this.userRepo.findUserByEmail(email);
    }

    if (!user) throw new AppError("User not found", 404);

    if (otp) {
      if (user.otp !== otp || new Date() > user.otpExpires) {
        throw new AppError("Invalid or expired OTP", 400);
      }
    } else if (curPassword) {
      const isPasswordValid = await comparePassword(curPassword, user.password);
      if (!isPasswordValid) throw new AppError("Invalid current password", 400);
    } else {
      throw new AppError("Current password or OTP required", 400);
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.userRepo.updateUser(user._id, {
      password: hashedPassword,
      otp: undefined,
      otpExpires: undefined,
    });
    return { message: "Password updated successfully" };
  }

  async logout(userId: string): Promise<{ message: string }> {
    const user = await this.userRepo.findUserById(userId);
    if (!user) throw new AppError("User not found", 404);

    await this.userRepo.updateRefreshToken(user._id, ""); // Clear refresh token
    return { message: "Logged out successfully" };
  }
}

export default AuthService; // Export as class for DI
