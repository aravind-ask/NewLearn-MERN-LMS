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
  }): Promise<IDiscussion>;
  getDiscussionById(
    discussionId: string
  ): Promise<IDiscussion & { comments: IComment[] }>;
  createComment(comment: {
    discussionId: string;
    userId: string;
    content: string;
  }): Promise<IComment>;
}
