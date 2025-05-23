import { IUserAnswer } from "../models/UserAnswer";
import { IInterview } from "../models/Interview";
import { IInterviewRepository } from "../repositories/interfaces/IInterviewRepository";

export class InterviewService {
  constructor(private interviewRepository: IInterviewRepository) {}

  async createInterview(interview: Partial<IInterview>): Promise<IInterview> {
    if (!interview.userId) {
      throw new Error("User ID is required");
    }
    return this.interviewRepository.create(interview);
  }

  async getInterview(id: string): Promise<IInterview> {
    const interview = await this.interviewRepository.findById(id);
    if (!interview) {
      throw new Error("Interview not found");
    }
    return interview;
  }

  async getInterviewsByUser(userId: string): Promise<IInterview[]> {
    const interviews = await this.interviewRepository.findByUserId(userId);
    return interviews;
  }

  async updateInterview(
    id: string,
    interview: Partial<IInterview>
  ): Promise<IInterview> {
    const updatedInterview = await this.interviewRepository.update(
      id,
      interview
    );
    if (!updatedInterview) {
      throw new Error("Interview not found");
    }
    return updatedInterview;
  }

  async createUserAnswer(
    userAnswer: Partial<IUserAnswer>
  ): Promise<IUserAnswer> {
    if (!userAnswer.userId || !userAnswer.mockIdRef) {
      throw new Error("User ID and Mock ID are required");
    }
    return this.interviewRepository.createUserAnswer(userAnswer);
    // Removed videoUrl update here since it’s handled by updateInterview
  }
  
  async getUserAnswer(
    userId: string,
    question: string,
    mockIdRef: string
  ): Promise<IUserAnswer | null> {
    return this.interviewRepository.findByUserAndQuestion(
      userId,
      question,
      mockIdRef
    );
  }

  async getUserAnswersByInterview(
    userId: string,
    mockIdRef: string
  ): Promise<IUserAnswer[]> {
    return this.interviewRepository.findByUserAndInterview(userId, mockIdRef);
  }
}
