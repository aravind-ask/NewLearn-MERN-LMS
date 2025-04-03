"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/Routes/instructor.application.routes.ts
const express_1 = __importDefault(require("express"));
const InstructorApplicationRepository_1 = require("../repositories/InstructorApplicationRepository");
const userRepository_1 = require("../repositories/userRepository");
const instructorApplication_service_1 = require("../services/instructorApplication.service");
const instructor_application_controller_1 = require("../Controllers/instructor.application.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authorizeRoles_1 = require("../middlewares/authorizeRoles");
const course_repository_1 = require("../repositories/course.repository");
const course_service_1 = require("../services/course.service");
const enrollment_repository_1 = require("../repositories/enrollment.repository");
const enrollment_service_1 = __importDefault(require("../services/enrollment.service"));
const course_controller_1 = require("../Controllers/course.controller");
const offer_service_1 = require("../services/offer.service");
const offer_repository_1 = require("../repositories/offer.repository");
// Initialize dependencies
const instructorAppRepository = new InstructorApplicationRepository_1.InstructorApplicationRepository();
const userRepository = new userRepository_1.UserRepository();
const instructorAppService = new instructorApplication_service_1.InstructorApplicationService(instructorAppRepository, userRepository);
const instructorAppController = new instructor_application_controller_1.InstructorApplicationController(instructorAppService);
const courseRepository = new course_repository_1.CourseRepository();
const offerService = new offer_service_1.OfferService(new offer_repository_1.OfferRepository());
const courseService = new course_service_1.CourseService(new course_repository_1.CourseRepository(), offerService);
const enrollmentRepository = new enrollment_repository_1.EnrollmentRepository();
const enrollmentService = new enrollment_service_1.default(enrollmentRepository);
const courseController = new course_controller_1.CourseController(courseService, enrollmentService);
const router = express_1.default.Router();
// Routes
router.post("/apply", auth_middleware_1.authMiddleware.verifyAccessToken, instructorAppController.applyForInstructor.bind(instructorAppController));
router.put("/re-apply/:applicationId", auth_middleware_1.authMiddleware.verifyAccessToken, instructorAppController.updateApplication.bind(instructorAppController));
router.get("/applications", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), instructorAppController.getApplications.bind(instructorAppController));
router.put("/review/:applicationId", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), instructorAppController.reviewApplication.bind(instructorAppController));
router.get("/application", auth_middleware_1.authMiddleware.verifyAccessToken, instructorAppController.getApplication.bind(instructorAppController));
router.get("/details/:instructorId", auth_middleware_1.authMiddleware.verifyAccessToken, instructorAppController.getInstructorDetails.bind(instructorAppController));
router.get("/application/:applicationId", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), instructorAppController.getApplicationDetails.bind(instructorAppController));
router.get("/courses", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["instructor"]), courseController.getInstructorCourses.bind(courseController));
exports.default = router;
