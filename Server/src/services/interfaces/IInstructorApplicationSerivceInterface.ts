// src/services/instructorApplication.service.interface.ts
import { IInstructorApplication } from "../../models/InstructorApplication";

export interface IInstructorApplicationService {
  applyForInstructor(
    userId: string | undefined,
    data: any
  ): Promise<IInstructorApplication>;
  getApplication(
    userId: string | undefined
  ): Promise<IInstructorApplication | null>;
  updateApplication(
    userId: string | undefined,
    data: any
  ): Promise<IInstructorApplication>;
  reviewApplication(
    applicationId: string,
    status: string,
    rejectionReason?: string
  ): Promise<IInstructorApplication>;
  getInstructorApplications(
    page: number,
    limit: number
  ): Promise<{ applications: IInstructorApplication[]; totalPages: number }>;
}
