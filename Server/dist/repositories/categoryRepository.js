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
const Category_1 = require("../models/Category");
class CategoryRepository {
    getAllCategories() {
        return __awaiter(this, arguments, void 0, function* (page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const [categories, total] = yield Promise.all([
                Category_1.Category.find().skip(skip).limit(limit).lean(),
                Category_1.Category.countDocuments(),
            ]);
            return { categories, total };
        });
    }
    getCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Category_1.Category.findById(id);
        });
    }
    createCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Category_1.Category.create(data);
        });
    }
    updateCategory(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Category_1.Category.findByIdAndUpdate(id, data, { new: true });
        });
    }
    deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Category_1.Category.findByIdAndDelete(id);
        });
    }
}
exports.CategoryRepository = CategoryRepository;
