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
      .lean();
  }

  async createDiscussion(
    discussion: Partial<IDiscussion>
  ): Promise<IDiscussion> {
    const createdDiscussion = await Discussion.create(discussion);
    return createdDiscussion.toObject();
  }

  async getDiscussionById(discussionId: string): Promise<IDiscussion> {
    const discussion = await Discussion.findById(
      new mongoose.Types.ObjectId(discussionId)
    )
      .populate("userId", "name")
      .lean();
    if (!discussion) throw new NotFoundError("Discussion not found");
    return discussion;
  }

  async getCommentsByDiscussion(discussionId: string): Promise<IComment[]> {
    const comments = await Comment.find({
      discussionId: new mongoose.Types.ObjectId(discussionId),
    })
      .populate("userId", "name")
      .lean();
    // @ts-ignore: Temporarily bypass type checking for this call
    return comments as IComment[];
  }

  async createComment(comment: Partial<IComment>): Promise<IComment> {
    const createdComment = await Comment.create(comment);
    return createdComment.toObject();
  }

  async editDiscussion(
    discussionId: string,
    topic: string,
    mediaUrl?: string
  ): Promise<IDiscussion> {
    const discussion = await Discussion.findByIdAndUpdate(
      new mongoose.Types.ObjectId(discussionId),
      { topic, mediaUrl, updatedAt: new Date() },
      { new: true }
    )
      .populate("userId", "name")
      .lean();
    if (!discussion) throw new NotFoundError("Discussion not found");
    return discussion;
  }

  async deleteDiscussion(discussionId: string): Promise<void> {
    const result = await Discussion.findByIdAndDelete(
      new mongoose.Types.ObjectId(discussionId)
    );
    if (!result) throw new NotFoundError("Discussion not found");
    await Comment.deleteMany({
      discussionId: new mongoose.Types.ObjectId(discussionId),
    });
  }

  async editComment(
    commentId: string,
    content: string,
    mediaUrl?: string
  ): Promise<IComment> {
    const comment = await Comment.findByIdAndUpdate(
      new mongoose.Types.ObjectId(commentId),
      { content, mediaUrl, updatedAt: new Date() },
      { new: true }
    )
      .populate("userId", "name")
      .lean();
    if (!comment) throw new NotFoundError("Comment not found");
    // @ts-ignore: Temporarily bypass type checking for this call
    return comment as IComment;
  }

  async deleteComment(commentId: string): Promise<{ discussionId: string }> {
    const comment = await Comment.findById(
      new mongoose.Types.ObjectId(commentId)
    ).lean();
    if (!comment) throw new NotFoundError("Comment not found");
    await Comment.findByIdAndDelete(new mongoose.Types.ObjectId(commentId));
    return { discussionId: comment.discussionId.toString() };
  }
}
