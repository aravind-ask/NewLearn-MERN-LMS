import { Category, ICategory } from "../models/Category";

export class CategoryRepository {
  async getAllCategories(): Promise<ICategory[]> {
    return Category.find();
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
