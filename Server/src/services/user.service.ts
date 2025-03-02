// src/services/user.service.ts
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { IUser } from "../models/User";
import bcrypt from "bcryptjs";
import { NotFoundError } from "../utils/customError";

export class UserService {
  constructor(private userRepo: IUserRepository) {}

  async updateProfile(
    userId: string,
    name?: string,
    email?: string,
    password?: string,
    photoUrl?: string,
    bio?: string,
    phoneNumber?: string,
    address?: string,
    dateOfBirth?: Date,
    education?: string
  ): Promise<IUser> {
    const updates: Partial<IUser> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (photoUrl) updates.photoUrl = photoUrl;
    if (bio) updates.bio = bio;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (address) updates.address = address;
    if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
    if (education) updates.education = education;

    const updatedUser = await this.userRepo.updateUser(userId, updates);
    if (!updatedUser) throw new NotFoundError("User not found");
    return updatedUser;
  }

  async getUsers(
    page: number,
    limit: number
  ): Promise<{ users: IUser[]; totalPages: number }> {
    return await this.userRepo.getAllUsers(page, limit);
  }

  async blockUser(userId: string, isBlocked: boolean): Promise<IUser> {
    const updatedUser = await this.userRepo.toggleBlockUser(userId, isBlocked);
    if (!updatedUser) throw new NotFoundError("User not found");
    return updatedUser;
  }

  async getUserStatus(userId: string): Promise<IUser> {
    const user = await this.userRepo.findUserById(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
}

export default UserService; // Keep as a class for DI, not instantiated here
