// src/Routes/user.routes.ts
import express, { Router } from "express";
import { UserRepository } from "../repositories/userRepository";
import { UserService } from "../services/user.service";
import { UserController } from "../Controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import EnrollmentService from "../services/enrollment.service";
import { EnrollmentRepository } from "../repositories/enrollment.repository";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const enrollmentRepository = new EnrollmentRepository();
const enrollmentService = new EnrollmentService(enrollmentRepository);
const userController = new UserController(userService, enrollmentService);


const router: Router = express.Router();

router.post("/upload-url", userController.getUploadUrl.bind(userController));
router.put(
  "/profile",
  authMiddleware.verifyAccessToken,
  userController.updateProfile.bind(userController)
);
router.get(
  "/users",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  userController.getUsers.bind(userController)
);
router.put(
  "/block",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  userController.blockUser.bind(userController)
);
router.get(
  "/courses",
  authMiddleware.verifyAccessToken,
  userController.getStudentCourses.bind(userController)
);
router.get(
  "/get-student-courses",
  authMiddleware.verifyAccessToken,
  userController.getStudentCourses.bind(userController)
);
router.get(
  "/status",
  authMiddleware.verifyAccessToken,
  userController.getUserStatus.bind(userController)
);

export default router;
