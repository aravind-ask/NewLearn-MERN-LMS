import express, { Router } from "express";
import { CourseController } from "../Controllers/course.controller";

const router: Router = express.Router();

router.post("/", CourseController.createCourse);
router.put("/:courseId", CourseController.editCourse);
router.delete("/:courseId", CourseController.deleteCourse);

export default router;
