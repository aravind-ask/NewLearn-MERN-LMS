// routes/discussion.routes.ts
import express from "express";
import { DiscussionController } from "../Controllers/discussion.controller";
import { DiscussionService } from "../services/discussion.service";
import { DiscussionRepository } from "../repositories/discussion.repository";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();
const discussionRepository = new DiscussionRepository();
const discussionService = new DiscussionService(discussionRepository);
const discussionController = new DiscussionController(discussionService);

router.get(
  "/lecture/:lectureId",
  authMiddleware.verifyAccessToken,
  discussionController.getDiscussionsByLecture.bind(discussionController)
);
router.post(
  "/create",
  authMiddleware.verifyAccessToken,
  discussionController.createDiscussion.bind(discussionController)
);
router.get(
  "/:discussionId",
  authMiddleware.verifyAccessToken,
  discussionController.getDiscussionById.bind(discussionController)
);
router.post(
  "/comment",
  authMiddleware.verifyAccessToken,
  discussionController.createComment.bind(discussionController)
);
router.put(
  "/edit",
  authMiddleware.verifyAccessToken,
  discussionController.editDiscussion.bind(discussionController)
);
router.delete(
  "/:discussionId",
  authMiddleware.verifyAccessToken,
  discussionController.deleteDiscussion.bind(discussionController)
);
router.put(
  "/comment/edit",
  authMiddleware.verifyAccessToken,
  discussionController.editComment.bind(discussionController)
);
router.delete(
  "/comment/:commentId",
  authMiddleware.verifyAccessToken,
  discussionController.deleteComment.bind(discussionController)
);

export default router;
