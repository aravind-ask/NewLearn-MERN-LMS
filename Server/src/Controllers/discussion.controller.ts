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
      const { lectureId, topic } = req.body;
      const userId = req.user?.id;
      if (!lectureId || !topic || !userId)
        throw new BadRequestError("Missing required fields");
      const discussion = await this.discussionService.createDiscussion({
        lectureId,
        userId,
        topic,
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
      const { discussionId, content } = req.body;
      const userId = req.user?.id;
      if (!discussionId || !content || !userId)
        throw new BadRequestError("Missing required fields");
      const comment = await this.discussionService.createComment({
        discussionId,
        userId,
        content,
      });
      successResponse(res, comment, "Comment added successfully");
      const io = req.app.get("io");
      io.to(`discussion_${discussionId}`).emit("newComment", comment);
    } catch (error) {
      errorResponse(res, error);
    }
  }
}
