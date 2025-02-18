import express, { Router } from "express";
import { CategoryController } from "../Controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router: Router = express.Router();
const categoryController = new CategoryController();

router.get("/", categoryController.getAllCategories);
router.post(
  "/",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  categoryController.createCategory
);
router.put(
  "/:id",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  categoryController.updateCategory
);
router.delete(
  "/:id",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  categoryController.deleteCategory
);

export default router;
