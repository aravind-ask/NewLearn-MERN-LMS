// src/routes/course.router.ts
import express, { Router } from "express";
import { CourseRepository } from "../repositories/course.repository";
import { CourseService } from "../services/course.service";
import { CourseController } from "../Controllers/course.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import EnrollmentService from "../services/enrollment.service";
import { EnrollmentRepository } from "../repositories/enrollment.repository";
import { OfferService } from "../services/offer.service";
import { OfferRepository } from "../repositories/offer.repository";

const courseRepository = new CourseRepository();
const offerService = new OfferService(new OfferRepository());
const courseService = new CourseService(new CourseRepository(), offerService);
const enrollmentRepository = new EnrollmentRepository();
const enrollmentService = new EnrollmentService(enrollmentRepository);
const courseController = new CourseController(courseService, enrollmentService);

const router: Router = express.Router();

router.get("/", courseController.getAllCourses.bind(courseController));
router.get(
  "/:courseId",
  courseController.getCourseDetails.bind(courseController)
);
router.get(
  "/enrolled/:courseId",
  authMiddleware.verifyAccessToken,
  courseController.checkCourseEnrollmentInfo.bind(courseController)
);
router.post(
  "/",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["instructor"]),
  courseController.createCourse.bind(courseController)
);
router.put(
  "/",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["instructor"]),
  courseController.editCourse.bind(courseController)
);
router.delete(
  "/:courseId",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["instructor", "admin"]),
  courseController.deleteCourse.bind(courseController)
);

export default router;
