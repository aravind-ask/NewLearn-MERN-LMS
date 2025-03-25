// controllers/discussion.controller.ts
import { Request, Response } from "express";
import { IDiscussionService } from "../services/interfaces/IDiscussionService";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { BadRequestError } from "../utils/customError";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export class DiscussionController {
  constructor(private discussionService: IDiscussionService) {}

  async getDiscussionsByLecture(req: AuthenticatedRequest, res: Response) {
    try {
      const { lectureId } = req.params;
      if (!lectureId) throw new BadRequestError("Lecture ID required");
      const discussions = await this.discussionService.getDiscussionsByLecture(
        lectureId
      );
      successResponse(res, discussions, "Discussions retrieved successfully");
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async createDiscussion(req: AuthenticatedRequest, res: Response) {
    try {
      const { lectureId, topic, mediaUrl } = req.body;
      const userId = req.user?.id;
      if (!lectureId || !topic || !userId)
        throw new BadRequestError("Missing required fields");
      const discussion = await this.discussionService.createDiscussion({
        lectureId,
        userId,
        topic,
        mediaUrl,
      });
      successResponse(res, discussion, "Discussion created successfully");
      const io = req.app.get("io");
      io.to(`lecture_${lectureId}`).emit("newDiscussion", discussion);
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async getDiscussionById(req: AuthenticatedRequest, res: Response) {
    try {
      const { discussionId } = req.params;
      if (!discussionId) throw new BadRequestError("Discussion ID required");
      const discussion = await this.discussionService.getDiscussionById(
        discussionId
      );
      successResponse(res, discussion, "Discussion retrieved successfully");
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async createComment(req: AuthenticatedRequest, res: Response) {
    try {
      const { discussionId, content, mediaUrl } = req.body;
      const userId = req.user?.id;
      if (!discussionId || !content || !userId)
        throw new BadRequestError("Missing required fields");
      const comment = await this.discussionService.createComment({
        discussionId,
        userId,
        content,
        mediaUrl,
      });
      successResponse(res, comment, "Comment added successfully");
      const io = req.app.get("io");
      io.to(`discussion_${discussionId}`).emit("newComment", comment);
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async editDiscussion(req: AuthenticatedRequest, res: Response) {
    try {
      const { discussionId, topic, mediaUrl } = req.body;
      const userId = req.user?.id;
      if (!discussionId || !topic || !userId)
        throw new BadRequestError("Missing required fields");
      const updatedDiscussion = await this.discussionService.editDiscussion(
        discussionId,
        userId,
        topic,
        mediaUrl
      );
      successResponse(
        res,
        updatedDiscussion,
        "Discussion updated successfully"
      );
      const io = req.app.get("io");
      io.to(`lecture_${updatedDiscussion.lectureId}`).emit(
        "editDiscussion",
        updatedDiscussion
      );
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async deleteDiscussion(req: AuthenticatedRequest, res: Response) {
    try {
      const { discussionId } = req.params;
      const userId = req.user?.id;
      if (!discussionId || !userId)
        throw new BadRequestError("Missing required fields");
      const discussion = await this.discussionService.getDiscussionById(
        discussionId
      );
      await this.discussionService.deleteDiscussion(discussionId, userId);
      successResponse(res, null, "Discussion deleted successfully");
      const io = req.app.get("io");
      io.to(`lecture_${discussion.lectureId}`).emit("deleteDiscussion", {
        discussionId,
      });
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async editComment(req: AuthenticatedRequest, res: Response) {
    try {
      const { commentId, content, mediaUrl } = req.body;
      const userId = req.user?.id;
      if (!commentId || !content || !userId)
        throw new BadRequestError("Missing required fields");
      const updatedComment = await this.discussionService.editComment(
        commentId,
        userId,
        content,
        mediaUrl
      );
      successResponse(res, updatedComment, "Comment updated successfully");
      const io = req.app.get("io");
      io.to(`discussion_${updatedComment.discussionId}`).emit(
        "editComment",
        updatedComment
      );
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async deleteComment(req: AuthenticatedRequest, res: Response) {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id;
      if (!commentId || !userId)
        throw new BadRequestError("Missing required fields");
      const { discussionId } = await this.discussionService.deleteComment(
        commentId,
        userId
      );
      successResponse(res, null, "Comment deleted successfully");
      const io = req.app.get("io");
      io.to(`discussion_${discussionId}`).emit("deleteComment", { commentId });
    } catch (error) {
      errorResponse(res, error);
    }
  }
}
