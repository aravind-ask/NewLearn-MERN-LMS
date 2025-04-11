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
exports.CategoryService = void 0;
// src/services/CategoryService.ts
const categoryRepository_1 = require("../repositories/categoryRepository");
class CategoryService {
    constructor() {
        this.categoryRepository = new categoryRepository_1.CategoryRepository();
    }
    getAllCategories(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (page < 1 || limit < 1) {
                throw new Error("Page and limit must be positive numbers");
            }
            return yield this.categoryRepository.getAllCategories(page, limit);
        });
    }
    createCategory(name, description) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!name)
                throw new Error("Category name is required");
            return yield this.categoryRepository.createCategory({ name, description });
        });
    }
    updateCategory(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.categoryRepository.updateCategory(id, name);
        });
    }
    deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.categoryRepository.deleteCategory(id);
        });
    }
}
exports.CategoryService = CategoryService;
