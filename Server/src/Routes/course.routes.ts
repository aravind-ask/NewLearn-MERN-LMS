import express, { Router } from "express";
import { CourseController } from "../Controllers/course.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router: Router = express.Router();

// router.get("/", CourseController.createCourse);
router.post("/", CourseController.createCourse);
router.put("/:courseId", CourseController.editCourse);
router.delete("/:courseId", CourseController.deleteCourse);


export default router;
