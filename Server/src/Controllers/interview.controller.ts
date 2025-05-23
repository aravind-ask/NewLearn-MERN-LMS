import { Request, Response } from "express";
import { InterviewService } from "../services/interview.service";
import { IInterview } from "../models/Interview";
import { IUserAnswer } from "@/models/UserAnswer";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export class InterviewController {
  constructor(private interviewService: InterviewService) {}

  async createInterview(req: Request, res: Response): Promise<void> {
    try {
      const interviewData: Partial<IInterview> = req.body;
      const newInterview = await this.interviewService.createInterview(
        interviewData
      );
      res.status(201).json(newInterview);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getInterview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const interview = await this.interviewService.getInterview(id);
      res.status(200).json(interview);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async getUserInterviews(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId || typeof userId !== "string") {
        res.status(400).json({ message: "userId is required" });
      }
      const interviews = await this.interviewService.getInterviewsByUser(
        userId!
      );
      res.status(200).json(interviews);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async updateInterview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const interviewData: Partial<IInterview> = req.body;
      const updatedInterview = await this.interviewService.updateInterview(
        id,
        interviewData
      );
      res.status(200).json(updatedInterview);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  async createUserAnswer(req: Request, res: Response): Promise<void> {
    try {
      const userAnswerData: Partial<IUserAnswer> = req.body;
      const newUserAnswer = await this.interviewService.createUserAnswer(
        userAnswerData
      );
      res.status(201).json(newUserAnswer);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getUserAnswer(req: Request, res: Response): Promise<void> {
    try {
      console.log("get answer working");
      const { userId, question, mockIdRef } = req.query;
      console.log("Query params:", { userId, question, mockIdRef });

      if (
        !userId ||
        typeof userId !== "string" ||
        !mockIdRef ||
        typeof mockIdRef !== "string"
      ) {
        throw new Error("userId and mockIdRef are required as strings");
      }

      if (question && typeof question === "string") {
        // Fetch a single user answer if question is provided
        const userAnswer = await this.interviewService.getUserAnswer(
          userId,
          question,
          mockIdRef
        );
        console.log("Single user answer:", userAnswer);
        res.status(200).json(userAnswer);
      } else {
        // Fetch all user answers for the interview if no question is provided
        const userAnswers =
          await this.interviewService.getUserAnswersByInterview(
            userId,
            mockIdRef
          );
        console.log("All user answers:", userAnswers);
        res.status(200).json(userAnswers);
      }
    } catch (error) {
      console.log("Error in getUserAnswer:", error);
      res.status(404).json({ message: (error as Error).message });
    }
  }
}
