import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository";
import { IUser } from "../models/User";
import { tokenUtils } from "../utils/tokenUtils";
import { comparePassword, hashPassword } from "..//utils/hashUtils";
import { sendOTPEmail } from "../utils/emailUtils";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../utils/appError";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<IUser> {
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new AppError("User already exists", 409);
    }

    const hashedPassword = await hashPassword(password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const user = await userRepository.createUser({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });
    await sendOTPEmail(email, otp);
    return user;
  },

  async verifyOtp(email: string, otp: string) {
    const user = await userRepository.findUserByEmail(email);
    if (!user || user.otp !== otp || new Date() > user.otpExpires) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    await userRepository.updateUser(user.id, {
      isVerified: true,
      otp: undefined,
      otpExpires: undefined,
    });
    return { message: "Email verified successfully" };
  },

  async sendOtp(email: string) {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await userRepository.updateUser(user.id, { otp, otpExpires });
    await sendOTPEmail(email, otp);
    return { message: "OTP sent successfully" };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError("Invalid credentials", 400);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 400);
    }

    const accessToken = tokenUtils.generateAccessToken({
      userId: user._id,
      role: user.role,
    });
    const refreshToken = tokenUtils.generateRefreshToken({ userId: user._id });

    await userRepository.updateRefreshToken(user._id, refreshToken);

    const data: {
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        photoUrl?: string;
      };
    } = {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
      },
    };

    return data;
  },

  async verifyGoogleToken(token: string) {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  },

  async authenticateGoogleUser(token: string) {
    const payload = await this.verifyGoogleToken(token);
    if (!payload) throw new AppError("Invalid Google Token", 401);

    const { sub, email, name, picture } = payload;

    let user = await userRepository.findUserByEmail(email!);
    if (!user) {
      user = await userRepository.createUser({
        googleId: sub,
        email,
        name,
        photoUrl: picture,
        role: "student",
      });
    }

    const accessToken = tokenUtils.generateAccessToken({
      userId: user._id,
      role: user.role,
    });

    const refreshToken = tokenUtils.generateRefreshToken({ userId: user._id });

    await userRepository.updateRefreshToken(user._id, refreshToken);

    const data: {
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        photoUrl?: string;
      };
    } = {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
      },
    };

    return data;
  },

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = tokenUtils.verifyRefreshToken(refreshToken);
      const user = await userRepository.findUserById(decoded.userId);

      if (!user || user.refreshToken !== refreshToken) {
        throw new Error("Invalid refresh token");
      }

      const accessToken = tokenUtils.generateAccessToken({
        userId: user._id,
        role: user.role,
      });
      const res = {
        accessToken,
        refreshToken,
      };
      return res;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  },

  async changePassword({ ...data }) {
    const { userId, email, curPassword, newPassword, otp } = data;
    let user;
    if (userId) {
      user = await userRepository.findUserById(userId);
    } else {
      user = await userRepository.findUserByEmail(email);
    }

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (otp) {
      if (user.otp !== otp || new Date() > user.otpExpires) {
        throw new AppError("Invalid or expired OTP", 400);
      }
    } else {
      const isPasswordValid = await comparePassword(curPassword, user.password);
      if (!isPasswordValid) {
        throw new AppError("Invalid current password", 400);
      }
    }
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await userRepository.updateUser(user._id, {
      password: hashedPassword,
      otp: undefined,
      otpExpires: undefined,
    });
    return { message: "Password updated successfully" };
  },

  async logout(userId: string) {
    const user = await userRepository.findUserById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    return { message: "Logged out successfully" };
  },
};
