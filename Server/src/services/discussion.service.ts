import { IDiscussion } from "../models/Discussion";
import { IComment, Comment } from "../models/Comment";
import mongoose from "mongoose";
import { IDiscussionRepository } from "../repositories/interfaces/IDiscussionRepository";
import { IDiscussionService } from "./interfaces/IDiscussionService";
import { ForbiddenError } from "../utils/customError";

export class DiscussionService implements IDiscussionService {
  constructor(private discussionRepository: IDiscussionRepository) {}

  async getDiscussionsByLecture(
    lectureId: string
  ): Promise<(IDiscussion & { commentsCount: number })[]> {
    const discussions = await this.discussionRepository.getDiscussionsByLecture(
      lectureId
    );

    return Promise.all(
      discussions.map(async (discussion) => {
        const commentsCount = await Comment.countDocuments({
          discussionId: discussion._id,
        });
        return {
          ...discussion,
          commentsCount,
        } as IDiscussion & { commentsCount: number };
      })
    );
  }

  async createDiscussion(discussion: {
    lectureId: string;
    userId: string;
    topic: string;
    mediaUrl?: string;
  }): Promise<IDiscussion> {
    return await this.discussionRepository.createDiscussion({
      lectureId: new mongoose.Types.ObjectId(discussion.lectureId),
      userId: new mongoose.Types.ObjectId(discussion.userId),
      topic: discussion.topic,
      mediaUrl: discussion.mediaUrl,
    });
  }

  async getDiscussionById(
    discussionId: string
  ): Promise<IDiscussion & { comments: IComment[] }> {
    const discussion = await this.discussionRepository.getDiscussionById(
      discussionId
    );
    const comments = await this.discussionRepository.getCommentsByDiscussion(
      discussionId
    );

    return {
      ...discussion,
      comments,
    } as IDiscussion & { comments: IComment[] };
  }

  async createComment(comment: {
    discussionId: string;
    userId: string;
    content: string;
    mediaUrl?: string;
  }): Promise<IComment> {
    return await this.discussionRepository.createComment({
      discussionId: new mongoose.Types.ObjectId(comment.discussionId),
      userId: new mongoose.Types.ObjectId(comment.userId),
      content: comment.content,
      mediaUrl: comment.mediaUrl,
    });
  }

  async editDiscussion(
    discussionId: string,
    userId: string,
    topic: string,
    mediaUrl?: string
  ): Promise<IDiscussion> {
    const discussion = await this.discussionRepository.getDiscussionById(
      discussionId
    );
    if (discussion.userId._id.toString() !== userId) {
      throw new ForbiddenError("You can only edit your own discussions");
    }
    return await this.discussionRepository.editDiscussion(
      discussionId,
      topic,
      mediaUrl
    );
  }

  async deleteDiscussion(discussionId: string, userId: string): Promise<void> {
    const discussion = await this.discussionRepository.getDiscussionById(
      discussionId
    );
    if (discussion.userId._id.toString() !== userId) {
      throw new ForbiddenError("You can only delete your own discussions");
    }
    await this.discussionRepository.deleteDiscussion(discussionId);
  }

  async editComment(
    commentId: string,
    userId: string,
    content: string,
    mediaUrl?: string
  ): Promise<IComment> {
    const comment = await Comment.findById(
      new mongoose.Types.ObjectId(commentId)
    ).lean();
    if (!comment) throw new Error("Comment not found");
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenError("You can only edit your own comments");
    }
    return await this.discussionRepository.editComment(
      commentId,
      content,
      mediaUrl
    );
  }

  async deleteComment(
    commentId: string,
    userId: string
  ): Promise<{ discussionId: string }> {
    const comment = await Comment.findById(
      new mongoose.Types.ObjectId(commentId)
    ).lean();
    if (!comment) throw new Error("Comment not found");
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenError("You can only delete your own comments");
    }
    return await this.discussionRepository.deleteComment(commentId);
  }
}
