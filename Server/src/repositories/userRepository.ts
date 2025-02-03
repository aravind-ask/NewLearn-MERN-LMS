import { User, IUser } from "../models/User";

export const userRepository = {
  async createUser(userData: Partial<IUser>) {
    const user = new User(userData);
    return await user.save();
  },

  async findUserByEmail(email: string) {
    return await User.findOne({ email });
  },

  async findUserById(userId: string) {
    return await User.findById(userId);
  },

  async updateRefreshToken(userId: string, refreshToken: string) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
  },

  async getAllUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const users = await User.find({}, "id name email role profilePic")
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    return { users, totalPages };
  },

  async updateUser(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  },
};
