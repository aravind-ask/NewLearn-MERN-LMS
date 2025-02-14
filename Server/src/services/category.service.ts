import { CategoryRepository } from "../repositories/categoryRepository";
import { ICategory } from "../models/Category";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getAllCategories(): Promise<ICategory[]> {
    return this.categoryRepository.getAllCategories();
  }

  async createCategory(name: string, description?: string): Promise<ICategory> {
    if (!name) throw new Error("Category name is required");
    return this.categoryRepository.createCategory({ name, description });
  }

  async updateCategory(
    id: string,
    data: Partial<ICategory>
  ): Promise<ICategory | null> {
    return this.categoryRepository.updateCategory(id, data);
  }

  async deleteCategory(id: string): Promise<ICategory | null> {
    return this.categoryRepository.deleteCategory(id);
  }
}
