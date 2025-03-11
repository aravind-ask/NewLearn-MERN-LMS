import { Category, ICategory } from "../models/Category";

export class CategoryRepository {
  async getAllCategories(
    page: number = 1,
    limit: number = 10
  ): Promise<{ categories: ICategory[]; total: number }> {
    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      Category.find().skip(skip).limit(limit).lean(),
      Category.countDocuments(),
    ]);
    return { categories, total };
  }
  async getCategoryById(id: string): Promise<ICategory | null> {
    return Category.findById(id);
  }

  async createCategory(data: {
    name: string;
    description?: string;
  }): Promise<ICategory> {
    return Category.create(data);
  }

  async updateCategory(
    id: string,
    data: Partial<ICategory>
  ): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    return Category.findByIdAndDelete(id);
  }
}
