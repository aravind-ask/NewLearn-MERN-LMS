// src/repositories/CategoryRepository.ts
import { Category, ICategory } from "../models/Category";
import { BaseRepository } from "./base.repository";
import { ICategoryRepository } from "./interfaces/ICategoryRepository";

export class CategoryRepository
  extends BaseRepository<ICategory>
  implements ICategoryRepository
{
  constructor() {
    super(Category);
  }

  async getAllCategories(
    page: number = 1,
    limit: number = 10
  ): Promise<{ categories: ICategory[]; total: number }> {
    try {
      const result = await this.findAll(page, limit);
      return {
        categories: result.items,
        total: result.totalItems,
      };
    } catch (error) {
      console.error("Error fetching all categories:", error);
      throw new Error("Failed to fetch all categories");
    }
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    return await this.findById(id);
  }

  async createCategory(data: {
    name: string;
    description?: string;
  }): Promise<ICategory> {
    return await this.create(data);
  }

  async updateCategory(
    id: string,
    name: Partial<ICategory>
  ): Promise<ICategory | null> {
    return await this.update(id, name);
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    return await this.delete(id);
  }
}
