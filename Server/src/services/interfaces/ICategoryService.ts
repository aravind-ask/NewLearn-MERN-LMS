// src/services/interfaces/ICategoryService.ts
import { ICategory } from "../../models/Category";

export interface ICategoryService {
  getAllCategories(
    page: number,
    limit: number
  ): Promise<{ categories: ICategory[]; total: number }>;
  createCategory(name: string, description?: string): Promise<ICategory>;
  updateCategory(
    id: string,
    name: Partial<ICategory>
  ): Promise<ICategory | null>;
  deleteCategory(id: string): Promise<ICategory | null>;
}
