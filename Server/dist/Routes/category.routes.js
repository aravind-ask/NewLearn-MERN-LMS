"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../Controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authorizeRoles_1 = require("../middlewares/authorizeRoles");
const router = express_1.default.Router();
const categoryController = new category_controller_1.CategoryController();
router.get("/", categoryController.getAllCategories);
router.post("/", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), categoryController.createCategory);
router.put("/:id", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), categoryController.updateCategory);
router.delete("/:id", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), categoryController.deleteCategory);
exports.default = router;
