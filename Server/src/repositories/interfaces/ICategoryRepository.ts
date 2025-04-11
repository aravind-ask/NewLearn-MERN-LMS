// src/repositories/interfaces/ICategoryRepository.ts
import { ICategory } from "../../models/Category";

export interface ICategoryRepository {
  getAllCategories(
    page: number,
    limit: number
  ): Promise<{ categories: ICategory[]; total: number }>;
  getCategoryById(id: string): Promise<ICategory | null>;
  createCategory(data: {
    name: string;
    description?: string;
  }): Promise<ICategory>;
  updateCategory(
    id: string,
    name: Partial<ICategory>
  ): Promise<ICategory | null>;
  deleteCategory(id: string): Promise<ICategory | null>;
}
