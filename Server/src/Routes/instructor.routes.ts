import express, { Router } from "express";
import { InstructorApplicationController } from "../Controllers/instructor.application.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import multer from "multer";
import { CourseController } from "../Controllers/course.controller";

const router: Router = express.Router();
const upload = multer();

router.post(
  "/apply",
  authMiddleware.verifyAccessToken,
  upload.none(),
  InstructorApplicationController.applyForInstructor
);

router.get(
  "/applications",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  InstructorApplicationController.getApplications
);
router.get(
  "/application",
  authMiddleware.verifyAccessToken,
  InstructorApplicationController.getApplication
);

router.put(
  "/review/:applicationId",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  InstructorApplicationController.reviewApplication
);

router.get(
  "/courses",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["instructor"]),
  CourseController.getInstructorCourses
);


export default router;
