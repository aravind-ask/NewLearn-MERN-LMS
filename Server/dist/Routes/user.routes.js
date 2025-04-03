"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/Routes/user.routes.ts
const express_1 = __importDefault(require("express"));
const userRepository_1 = require("../repositories/userRepository");
const user_service_1 = require("../services/user.service");
const user_controller_1 = require("../Controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authorizeRoles_1 = require("../middlewares/authorizeRoles");
const enrollment_service_1 = __importDefault(require("../services/enrollment.service"));
const enrollment_repository_1 = require("../repositories/enrollment.repository");
const userRepository = new userRepository_1.UserRepository();
const userService = new user_service_1.UserService(userRepository);
const enrollmentRepository = new enrollment_repository_1.EnrollmentRepository();
const enrollmentService = new enrollment_service_1.default(enrollmentRepository);
const userController = new user_controller_1.UserController(userService, enrollmentService);
const router = express_1.default.Router();
router.post("/upload-url", userController.getUploadUrl.bind(userController));
router.put("/update-profile", auth_middleware_1.authMiddleware.verifyAccessToken, userController.updateProfile.bind(userController));
router.get("/get-users", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), userController.getUsers.bind(userController));
router.put("/block", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), userController.blockUser.bind(userController));
router.get("/courses", auth_middleware_1.authMiddleware.verifyAccessToken, userController.getStudentCourses.bind(userController));
router.get("/get-student-courses", auth_middleware_1.authMiddleware.verifyAccessToken, userController.getStudentCourses.bind(userController));
router.get("/status", auth_middleware_1.authMiddleware.verifyAccessToken, userController.getUserStatus.bind(userController));
exports.default = router;
