import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository";
import { IUser } from "../models/User";
import { tokenUtils } from "../utils/tokenUtils";
import { comparePassword, hashPassword } from "..//utils/hashUtils";
import { sendOTPEmail } from "../utils/emailUtils";

export const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<IUser> {
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
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
      throw new Error("Invalid or expired OTP");
    }

    await userRepository.updateUser(user.id, {
      isVerified: true,
      otp: undefined,
      otpExpires: undefined,
    });
    return { message: "Email verified successfully" };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const accessToken = tokenUtils.generateAccessToken({
      userId: user._id,
      role: user.role,
    });
    const refreshToken = tokenUtils.generateRefreshToken({ userId: user._id });

    await userRepository.updateRefreshToken(user._id, refreshToken);

    return { accessToken, refreshToken };
  },

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
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
      return { accessToken };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
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
