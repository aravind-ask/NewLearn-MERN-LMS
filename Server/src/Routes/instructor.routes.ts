// src/Routes/instructor.application.routes.ts
import express, { Router } from "express";
import { InstructorApplicationRepository } from "../repositories/InstructorApplicationRepository";
import { UserRepository } from "../repositories/userRepository";
import { InstructorApplicationService } from "../services/instructorApplication.service";
import { InstructorApplicationController } from "../Controllers/instructor.application.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { CourseRepository } from "../repositories/course.repository";
import { CourseService } from "../services/course.service";
import { EnrollmentRepository } from "../repositories/enrollment.repository";
import EnrollmentService from "../services/enrollment.service";
import { CourseController } from "../Controllers/course.controller";

// Initialize dependencies
const instructorAppRepository = new InstructorApplicationRepository();
const userRepository = new UserRepository();
const instructorAppService = new InstructorApplicationService(
  instructorAppRepository,
  userRepository
);
const instructorAppController = new InstructorApplicationController(
  instructorAppService
);
const courseRepository = new CourseRepository();
const courseService = new CourseService(courseRepository);
const enrollmentRepository = new EnrollmentRepository();
const enrollmentService = new EnrollmentService(enrollmentRepository);
const courseController = new CourseController(courseService, enrollmentService);

const router: Router = express.Router();

// Routes
router.post(
  "/apply",
  authMiddleware.verifyAccessToken,
  instructorAppController.applyForInstructor.bind(instructorAppController)
);
router.get(
  "/applications",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  instructorAppController.getApplications.bind(instructorAppController)
);
router.put(
  "/review/:applicationId",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  instructorAppController.reviewApplication.bind(instructorAppController)
);
router.get(
  "/application",
  authMiddleware.verifyAccessToken,
  instructorAppController.getApplication.bind(instructorAppController)
);
router.get(
  "/details/:instructorId",
  authMiddleware.verifyAccessToken,
  instructorAppController.getInstructorDetails.bind(instructorAppController)
);
router.get(
  "/application/:applicationId",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  instructorAppController.getApplicationDetails.bind(instructorAppController)
);

router.get(
  "/courses",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["instructor"]),
  courseController.getInstructorCourses.bind(courseController)
);

export default router;
