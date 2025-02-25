import express, { Router } from "express";
import { CourseController } from "../Controllers/course.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router: Router = express.Router();

router.get("/", CourseController.getAllCourses);
router.get("/:courseId", CourseController.getCourseDetails);
router.get(
  "/enrolled/:courseId",
  authMiddleware.verifyAccessToken,
  CourseController.checkCourseEnrollmentInfo
);
router.post(
  "/",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["instructor"]),
  CourseController.createCourse
);
router.put(
  "/",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["instructor"]),
  CourseController.editCourse
);
router.delete(
  "/:courseId",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["instructor", "admin"]),
  CourseController.deleteCourse
);

export default router;
