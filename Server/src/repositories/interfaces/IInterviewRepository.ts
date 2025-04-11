import { IUserAnswer } from "../../models/UserAnswer";
import { IInterview } from "../../models/Interview";
import { UpdateQuery } from "mongoose";

export interface IInterviewRepository {
  create(interview: Partial<IInterview>): Promise<IInterview>;
  findById(id: string): Promise<IInterview | null>;
  findByUserId(userId: string): Promise<IInterview[]>;
  update(
    id: string,
    interview: UpdateQuery<IInterview>
  ): Promise<IInterview | null>; // Updated type
  createUserAnswer(userAnswer: Partial<IUserAnswer>): Promise<IUserAnswer>;
  findByUserAndQuestion(
    userId: string,
    question: string,
    mockIdRef: string
  ): Promise<IUserAnswer | null>;
  findByUserAndInterview(
    userId: string,
    mockIdRef: string
  ): Promise<IUserAnswer[]>;
}
