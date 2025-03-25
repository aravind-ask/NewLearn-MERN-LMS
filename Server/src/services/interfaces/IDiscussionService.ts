// services/interfaces/IDiscussionService.ts
import { IDiscussion } from "../../models/Discussion";
import { IComment } from "../../models/Comment";

export interface IDiscussionService {
  getDiscussionsByLecture(
    lectureId: string
  ): Promise<(IDiscussion & { commentsCount: number })[]>;
  createDiscussion(discussion: {
    lectureId: string;
    userId: string;
    topic: string;
    mediaUrl?: string;
  }): Promise<IDiscussion>;
  getDiscussionById(
    discussionId: string
  ): Promise<IDiscussion & { comments: IComment[] }>;
  createComment(comment: {
    discussionId: string;
    userId: string;
    content: string;
    mediaUrl?: string;
  }): Promise<IComment>;
  editDiscussion(
    discussionId: string,
    userId: string,
    topic: string,
    mediaUrl?: string
  ): Promise<IDiscussion>;
  deleteDiscussion(discussionId: string, userId: string): Promise<void>;
  editComment(
    commentId: string,
    userId: string,
    content: string,
    mediaUrl?: string
  ): Promise<IComment>;
  deleteComment(
    commentId: string,
    userId: string
  ): Promise<{ discussionId: string }>;
}
