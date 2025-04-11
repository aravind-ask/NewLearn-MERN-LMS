// src/repositories/UserRepository.ts
import { User, IUser } from "../models/User";
import { IUserRepository } from "./interfaces/IUserRepository";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    return await this.create(userData);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.model.findOne({ email }).exec();
    } catch (error) {
      throw new Error("Error finding user by email");
    }
  }

  async findUserById(userId: string): Promise<IUser | null> {
    return await this.findById(userId);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<IUser | null> {
    return await this.update(userId, { refreshToken });
  }

  async getAllUsers(
    page: number,
    limit: number,
    search?: string 
  ): Promise<{ users: IUser[]; totalPages: number }> {
    try {
      const query: any = { role: { $ne: "admin" } };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } }, 
          { email: { $regex: search, $options: "i" } },
        ];
      }

      const result = await this.findAll(page, limit, query);
      return {
        users: result.items,
        totalPages: result.totalPages,
      };
    } catch (error) {
      throw new Error("Error fetching users");
    }
  }

  async updateUser(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await this.update(userId, updateData);
  }

  async toggleBlockUser(
    userId: string,
    isBlocked: boolean
  ): Promise<IUser | null> {
    return await this.update(userId, { isBlocked });
  }

  async updateUserRole(
    userId: string,
    role: "student" | "instructor" | "admin"
  ): Promise<IUser | null> {
    return await this.update(userId, { role });
  }

  async deleteUser(userId: string): Promise<IUser | null> {
    return await this.delete(userId);
  }
}
