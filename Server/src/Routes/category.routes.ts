import express, { Router } from "express";
import { CategoryController } from "../Controllers/category.controller";

const router: Router = express.Router();
const categoryController = new CategoryController();

router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
