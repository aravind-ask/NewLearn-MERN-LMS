import { Discussion, IDiscussion } from "../models/Discussion";
import { Comment, IComment } from "../models/Comment";
import { NotFoundError } from "../utils/customError";
import mongoose from "mongoose";
import { IDiscussionRepository } from "./interfaces/IDiscussionRepository";

export class DiscussionRepository implements IDiscussionRepository {
  async getDiscussionsByLecture(lectureId: string): Promise<IDiscussion[]> {
    return await Discussion.find({
      lectureId: new mongoose.Types.ObjectId(lectureId),
    })
      .populate("userId", "name")
      .lean(); // Convert to plain objects
  }

  async createDiscussion(
    discussion: Partial<IDiscussion>
  ): Promise<IDiscussion> {
    const createdDiscussion = await Discussion.create(discussion);
    return createdDiscussion.toObject(); // Convert to plain object
  }

  async getDiscussionById(discussionId: string): Promise<IDiscussion> {
    const discussion = await Discussion.findById(
      new mongoose.Types.ObjectId(discussionId)
    )
      .populate("userId", "name")
      .lean(); // Convert to plain object
    if (!discussion) throw new NotFoundError("Discussion not found");
    return discussion;
  }

  async getCommentsByDiscussion(discussionId: string): Promise<IComment[]> {
    const comments = await Comment.find({
      discussionId: new mongoose.Types.ObjectId(discussionId),
    })
      .populate("userId", "name")
      .lean(); // Convert to plain objects

    return comments as IComment[]; // Explicitly cast to IComment[]
  }

  async createComment(comment: Partial<IComment>): Promise<IComment> {
    const createdComment = await Comment.create(comment);
    return createdComment.toObject(); // Convert to plain object
  }
}
