import express, { Router } from "express";
import { CourseController } from "../Controllers/course.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router: Router = express.Router();

router.get("/", CourseController.getAllCourses);
router.get("/:courseId", CourseController.getCourseDetails);
router.post("/", CourseController.createCourse);
router.put("/", CourseController.editCourse);
router.delete("/:courseId", CourseController.deleteCourse);

export default router;
