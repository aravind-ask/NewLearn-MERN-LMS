import { Request, Response } from "express";
import { InterviewService } from "../services/interview.service";
import { IInterview } from "../models/Interview";

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
}
