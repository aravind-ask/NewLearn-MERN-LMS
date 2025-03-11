import express from "express";
import { CourseProgressController } from "../Controllers/course.progress.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { CourseProgressService } from "../services/course.progress.service";

const router = express.Router();
const courseProgressController = new CourseProgressController(
  new CourseProgressService()
);

router.post(
  "/mark-lecture-viewed",
  authMiddleware.verifyAccessToken,
  courseProgressController.markCurrentLectureAsViewed.bind(
    courseProgressController
  )
);
router.get(
  "/:courseId",
  authMiddleware.verifyAccessToken,
  courseProgressController.getCurrentCourseProgress.bind(
    courseProgressController
  )
);
router.post(
  "/reset-progress",
  authMiddleware.verifyAccessToken,
  courseProgressController.resetCurrentCourseProgress.bind(
    courseProgressController
  )
);

export default router;
