import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { errorResponse, successResponse } from "../utils/responseHandler";

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { categories, total } = await this.categoryService.getAllCategories(
        page,
        limit
      );
      successResponse(
        res,
        {
          data: categories,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
        "Categories fetched successfully",
        200
      );
    } catch (error: any) {
      errorResponse(
        res,
        error.message || "Failed to fetch categories",
        error.status || 500
      );
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description } = req.body;
      const category = await this.categoryService.createCategory(
        name,
        description
      );
      successResponse(res, category, "Category created successfully", 201);
    } catch (error: any) {
      errorResponse(res, error.message, error.status || 400);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      console.log("name", name);
      const updatedCategory = await this.categoryService.updateCategory(
        id,
        name
      );
      if (!updatedCategory) errorResponse(res, "Category not found", 404);

      successResponse(
        res,
        updatedCategory,
        "Category updated successfully",
        200
      );
    } catch (error: any) {
      errorResponse(res, error.message, error.status || 500);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deletedCategory = await this.categoryService.deleteCategory(id);
      if (!deletedCategory) errorResponse(res, "Category not found", 404);

      successResponse(res, null, "Category deleted successfully", 200);
    } catch (error: any) {
      errorResponse(res, error.message, error.status || 500);
    }
  };
}
