"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("../services/category.service");
const responseHandler_1 = require("../utils/responseHandler");
const statusCodes_1 = require("../utils/statusCodes");
class CategoryController {
    constructor() {
        this.getAllCategories = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { categories, total } = yield this.categoryService.getAllCategories(page, limit);
                (0, responseHandler_1.successResponse)(res, {
                    data: categories,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                }, "Categories fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message || "Failed to fetch categories", error.status);
            }
        });
        this.createCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, description } = req.body;
                const category = yield this.categoryService.createCategory(name, description);
                (0, responseHandler_1.successResponse)(res, category, "Category created successfully", statusCodes_1.HttpStatus.CREATED);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.status || 400);
            }
        });
        this.updateCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name } = req.body;
                console.log("Request body:", req.body, "Name:", name);
                if (!name) {
                    (0, responseHandler_1.errorResponse)(res, "Name is required", statusCodes_1.HttpStatus.BAD_REQUEST);
                }
                const updatedCategory = yield this.categoryService.updateCategory(id, {
                    name,
                });
                if (!updatedCategory) {
                    (0, responseHandler_1.errorResponse)(res, "Category not found", statusCodes_1.HttpStatus.NOT_FOUND);
                }
                (0, responseHandler_1.successResponse)(res, updatedCategory, "Category updated successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.status || statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
        this.deleteCategory = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deletedCategory = yield this.categoryService.deleteCategory(id);
                if (!deletedCategory)
                    (0, responseHandler_1.errorResponse)(res, "Category not found", statusCodes_1.HttpStatus.NOT_FOUND);
                (0, responseHandler_1.successResponse)(res, null, "Category deleted successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.status);
            }
        });
        this.categoryService = new category_service_1.CategoryService();
    }
}
exports.CategoryController = CategoryController;
