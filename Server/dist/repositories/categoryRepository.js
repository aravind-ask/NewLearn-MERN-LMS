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
exports.CategoryRepository = void 0;
// src/repositories/CategoryRepository.ts
const Category_1 = require("../models/Category");
const base_repository_1 = require("./base.repository");
class CategoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Category_1.Category);
    }
    getAllCategories() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            try {
                const result = yield this.findAll(page, limit);
                return {
                    categories: result.items,
                    total: result.totalItems,
                };
            }
            catch (error) {
                console.error("Error fetching all categories:", error);
                throw new Error("Failed to fetch all categories");
            }
        });
    }
    getCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findById(id);
        });
    }
    createCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.create(data);
        });
    }
    updateCategory(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.update(id, name);
        });
    }
    deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.delete(id);
        });
    }
}
exports.CategoryRepository = CategoryRepository;
