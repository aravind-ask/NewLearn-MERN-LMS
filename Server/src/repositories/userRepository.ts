// src/repositories/userRepository.ts
import { User, IUser } from "../models/User";
import { IUserRepository } from "./interfaces/IUserRepository";

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw new Error("Error creating user");
    }
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email }).exec();
    } catch (error) {
      throw new Error("Error finding user by email");
    }
  }

  async findUserById(userId: string): Promise<IUser | null> {
    try {
      return await User.findById(userId).exec();
    } catch (error) {
      throw new Error("Error finding user by ID");
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { refreshToken },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error("Error updating refresh token");
    }
  }

  async getAllUsers(
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const users = await User.find(
        { role: { $ne: "admin" } },
        "id name email role photoUrl isBlocked"
      )
        .skip(skip)
        .limit(limit)
        .exec();

      const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
      const totalPages = Math.ceil(totalUsers / limit);

      return { users, totalPages };
    } catch (error) {
      throw new Error("Error fetching users");
    }
  }

  async updateUser(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).exec();
    } catch (error) {
      throw new Error("Error updating user");
    }
  }

  async toggleBlockUser(
    userId: string,
    isBlocked: boolean
  ): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { isBlocked },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error("Error toggling block status");
    }
  }

  async updateUserRole(userId: string, role: string): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error("Error updating user role");
    }
  }
}
