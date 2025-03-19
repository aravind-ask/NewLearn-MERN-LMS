import { IDiscussion } from "../models/Discussion";
import { IComment, Comment } from "../models/Comment";
import mongoose from "mongoose";
import { IDiscussionRepository } from "../repositories/interfaces/IDiscussionRepository";
import { IDiscussionService } from "./interfaces/IDiscussionService";

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
  }): Promise<IDiscussion> {
    return await this.discussionRepository.createDiscussion({
      lectureId: new mongoose.Types.ObjectId(discussion.lectureId),
      userId: new mongoose.Types.ObjectId(discussion.userId),
      topic: discussion.topic,
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
  }): Promise<IComment> {
    return await this.discussionRepository.createComment({
      discussionId: new mongoose.Types.ObjectId(comment.discussionId),
      userId: new mongoose.Types.ObjectId(comment.userId),
      content: comment.content,
    });
  }
}
