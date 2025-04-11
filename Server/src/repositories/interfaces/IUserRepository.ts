import { IUser } from "../../models/User";

export interface IUserRepository {
  createUser(userData: Partial<IUser>): Promise<IUser>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserById(userId: string): Promise<IUser | null>;
  updateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<IUser | null>;
  getAllUsers(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ users: IUser[]; totalPages: number }>;
  updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
  toggleBlockUser(userId: string, isBlocked: boolean): Promise<IUser | null>;
  updateUserRole(userId: string, role: string): Promise<IUser | null>;
  deleteUser(userId: string): Promise<IUser | null>;
}
