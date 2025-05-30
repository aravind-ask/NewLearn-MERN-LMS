// repositories/interfaces/IDiscussionRepository.ts
import { IDiscussion } from "../../models/Discussion";
import { IComment } from "../../models/Comment";

export interface IDiscussionRepository {
  getDiscussionsByLecture(lectureId: string): Promise<IDiscussion[]>;
  createDiscussion(discussion: Partial<IDiscussion>): Promise<IDiscussion>;
  getDiscussionById(discussionId: string): Promise<IDiscussion>;
  getCommentsByDiscussion(discussionId: string): Promise<IComment[]>;
  createComment(comment: Partial<IComment>): Promise<IComment>;
  editDiscussion(
    discussionId: string,
    topic: string,
    mediaUrl?: string
  ): Promise<IDiscussion>;
  deleteDiscussion(discussionId: string): Promise<void>;
  editComment(
    commentId: string,
    content: string,
    mediaUrl?: string
  ): Promise<IComment>;
  deleteComment(commentId: string): Promise<{ discussionId: string }>;
}
