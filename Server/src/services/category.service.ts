// src/services/CategoryService.ts
import { CategoryRepository } from "../repositories/categoryRepository";
import { ICategory } from "../models/Category";
import { ICategoryService } from "./interfaces/ICategoryService";

export class CategoryService implements ICategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getAllCategories(
    page: number,
    limit: number
  ): Promise<{ categories: ICategory[]; total: number }> {
    if (page < 1 || limit < 1) {
      throw new Error("Page and limit must be positive numbers");
    }
    return await this.categoryRepository.getAllCategories(page, limit);
  }

  async createCategory(name: string, description?: string): Promise<ICategory> {
    if (!name) throw new Error("Category name is required");
    return await this.categoryRepository.createCategory({ name, description });
  }

  async updateCategory(
    id: string,
    name: Partial<ICategory>
  ): Promise<ICategory | null> {
    return await this.categoryRepository.updateCategory(id, name);
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    return await this.categoryRepository.deleteCategory(id);
  }
}
