import { userRepository } from "../repositories/userRepository";
import bcrypt from "bcryptjs";

class UserService {
  async updateProfile(
    userId: string,
    name?: string,
    email?: string,
    password?: string,
    profilePic?: string
  ) {
    const updates: any = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (profilePic) updates.profilePic = profilePic;
    const updatedUser = await userRepository.updateUser(userId, updates);
    return await userRepository.updateUser(userId, updates);
  }
  async getUsers(page: number, limit: number) {
    return await userRepository.getAllUsers(page, limit);
  }
  async blockUser(userId: string, isBlocked: boolean) {
    return await userRepository.toggleBlockUser(userId, isBlocked);
  }
}

export default new UserService();
