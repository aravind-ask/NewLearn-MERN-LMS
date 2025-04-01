import { IUserAnswer, UserAnswerModel } from "../models/UserAnswer";
import { InterviewModel, IInterview } from "../models/Interview";
import { IInterviewRepository } from "./interfaces/IInterviewRepository";

export class InterviewRepository implements IInterviewRepository {
  async create(interview: Partial<IInterview>): Promise<IInterview> {
    const newInterview = await InterviewModel.create(interview);
    return newInterview.toObject() as IInterview;
  }

  async findById(id: string): Promise<IInterview | null> {
    const interview = await InterviewModel.findById(id).lean();
    return interview as IInterview | null;
  }

  async findByUserId(userId: string): Promise<IInterview[]> {
    const interviews = await InterviewModel.find({ userId }).lean();
    return interviews as IInterview[];
  }

  async update(
    id: string,
    interview: Partial<IInterview>
  ): Promise<IInterview | null> {
    const updatedInterview = await InterviewModel.findByIdAndUpdate(
      id,
      { ...interview, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();
    return updatedInterview as IInterview | null;
  }

  async createUserAnswer(
    userAnswer: Partial<IUserAnswer>
  ): Promise<IUserAnswer> {
    const newUserAnswer = await UserAnswerModel.create(userAnswer);
    return newUserAnswer.toObject() as IUserAnswer;
  }

  async findByUserAndQuestion(
    userId: string,
    question: string,
    mockIdRef: string
  ): Promise<IUserAnswer | null> {
    const userAnswer = await UserAnswerModel.findOne({
      userId,
      question,
      mockIdRef,
    }).lean();
    return userAnswer as IUserAnswer | null;
  }

  async findByUserAndInterview(
    userId: string,
    mockIdRef: string
  ): Promise<IUserAnswer[]> {
    const userAnswers = await UserAnswerModel.find({
      userId,
      mockIdRef,
    }).lean();
    return userAnswers as IUserAnswer[];
  }
}
