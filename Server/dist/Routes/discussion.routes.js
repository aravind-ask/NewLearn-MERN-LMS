"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/discussion.routes.ts
const express_1 = __importDefault(require("express"));
const discussion_controller_1 = require("../Controllers/discussion.controller");
const discussion_service_1 = require("../services/discussion.service");
const discussion_repository_1 = require("../repositories/discussion.repository");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const discussionRepository = new discussion_repository_1.DiscussionRepository();
const discussionService = new discussion_service_1.DiscussionService(discussionRepository);
const discussionController = new discussion_controller_1.DiscussionController(discussionService);
router.get("/lecture/:lectureId", auth_middleware_1.authMiddleware.verifyAccessToken, discussionController.getDiscussionsByLecture.bind(discussionController));
router.post("/create", auth_middleware_1.authMiddleware.verifyAccessToken, discussionController.createDiscussion.bind(discussionController));
router.get("/:discussionId", auth_middleware_1.authMiddleware.verifyAccessToken, discussionController.getDiscussionById.bind(discussionController));
router.post("/comment", auth_middleware_1.authMiddleware.verifyAccessToken, discussionController.createComment.bind(discussionController));
router.put("/edit", auth_middleware_1.authMiddleware.verifyAccessToken, discussionController.editDiscussion.bind(discussionController));
router.delete("/:discussionId", auth_middleware_1.authMiddleware.verifyAccessToken, discussionController.deleteDiscussion.bind(discussionController));
router.put("/comment/edit", auth_middleware_1.authMiddleware.verifyAccessToken, discussionController.editComment.bind(discussionController));
router.delete("/comment/:commentId", auth_middleware_1.authMiddleware.verifyAccessToken, discussionController.deleteComment.bind(discussionController));
exports.default = router;
