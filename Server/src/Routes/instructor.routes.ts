import express from "express";
import { InstructorApplicationController } from "../Controllers/instructor.application.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import multer from "multer";


const router = express.Router();
const upload = multer();

router.post(
  "/apply",
  authMiddleware.verifyAccessToken,upload.none(),
  InstructorApplicationController.applyForInstructor
);

router.get(
  "/applications",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  InstructorApplicationController.getApplications
);
router.get(
  "/:applicationId",
  authMiddleware.verifyAccessToken,
  InstructorApplicationController.getApplication
);

router.put(
  "/review/:applicationId",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  InstructorApplicationController.reviewApplication
);

export default router;
