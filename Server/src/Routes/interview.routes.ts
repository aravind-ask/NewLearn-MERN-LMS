import { Router } from "express";
import { InterviewController } from "../Controllers/interview.controller";
import { InterviewRepository } from "../repositories/interview.repository";
import { InterviewService } from "../services/interview.service";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const interviewRepository = new InterviewRepository();
const interviewService = new InterviewService(interviewRepository);
const interviewController = new InterviewController(interviewService);

router.post("/", authMiddleware.verifyAccessToken, (req, res) =>
  interviewController.createInterview(req, res)
);
router.get("/", authMiddleware.verifyAccessToken, (req, res) =>
  interviewController.getUserInterviews(req, res)
);
router.post("/user-answers", (req, res) =>
  interviewController.createUserAnswer(req, res)
);
router.get("/user-answers", (req, res) =>
  interviewController.getUserAnswer(req, res)
);
router.get("/:id", authMiddleware.verifyAccessToken, (req, res) =>
  interviewController.getInterview(req, res)
);
router.patch("/:id", authMiddleware.verifyAccessToken, (req, res) =>
  interviewController.updateInterview(req, res)
);

export default router;
