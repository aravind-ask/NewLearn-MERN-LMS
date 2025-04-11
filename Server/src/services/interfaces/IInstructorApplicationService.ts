// src/services/interfaces/IInstructorApplicationService.ts
import { IInstructorApplication } from "../../models/InstructorApplication";

export interface IInstructorApplicationService {
  applyForInstructor(
    userId: string | undefined,
    applicationData: Partial<IInstructorApplication>
  ): Promise<IInstructorApplication>;
  updateApplication(
    applicationId: string,
    data: Partial<IInstructorApplication>
  ): Promise<IInstructorApplication>;
  getInstructorApplications(
    page: number,
    limit: number
  ): Promise<{ applications: IInstructorApplication[]; totalPages: number }>;
  getApplication(userId: string | undefined): Promise<IInstructorApplication>;
  getApplicationDetails(applicationId: string): Promise<IInstructorApplication>;
  reviewApplication(
    applicationId: string,
    status: "approved" | "rejected",
    rejectionReason?: string
  ): Promise<IInstructorApplication>;
  getInstructorDetails(userId: string): Promise<IInstructorApplication>; // Added
}
