// src/repositories/IInstructorApplicationRepository.ts
import { IInstructorApplication } from "../../models/InstructorApplication";

export interface IInstructorApplicationRepository {
  createApplication(
    data: Partial<IInstructorApplication>
  ): Promise<IInstructorApplication>;
  getApplications(
    page: number,
    limit: number
  ): Promise<{
    applications: IInstructorApplication[];
    totalPages: number;
    totalApplications: number;
  }>;
  getApplicationById(
    applicationId: string
  ): Promise<IInstructorApplication | null>;
  getApplication(userId: string): Promise<IInstructorApplication | null>;
  updateApplicationStatus(
    applicationId: string,
    status: string,
    rejectionReason?: string
  ): Promise<IInstructorApplication | null>;
}
