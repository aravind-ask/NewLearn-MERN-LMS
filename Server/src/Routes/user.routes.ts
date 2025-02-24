import express, { Router } from "express";
import {
  blockUser,
  getStudentCourses,
  getUploadUrl,
  getUsers,
  updateProfile,
} from "../Controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router: Router = express.Router();

router.post("/upload-url", authMiddleware.verifyAccessToken, getUploadUrl);
router.put("/update-profile", authMiddleware.verifyAccessToken, updateProfile);
router.get(
  "/get-users",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  getUsers
);
router.post(
  "/block",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  blockUser
);
router.get(
  "/get-student-courses",
  authMiddleware.verifyAccessToken,
  getStudentCourses
);

export default router;
