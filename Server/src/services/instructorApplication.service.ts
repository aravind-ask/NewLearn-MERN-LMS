// src/services/instructorApplication.service.ts
import { IInstructorApplicationRepository } from "../repositories/interfaces/IInstructorApplicationRepository";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { BadRequestError, NotFoundError } from "../utils/customError";
import { IInstructorApplication } from "../models/InstructorApplication";

export class InstructorApplicationService {
  constructor(
    private instructorAppRepo: IInstructorApplicationRepository,
    private userRepo: IUserRepository
  ) {}

  async applyForInstructor(
    userId: string | undefined,
    applicationData: any
  ): Promise<IInstructorApplication> {
    if (!userId) throw new BadRequestError("User ID is required");

    const existingApplication = await this.instructorAppRepo.getApplication(
      userId
    );
    if (existingApplication) {
      throw new BadRequestError(
        "You have already applied for instructor verification"
      );
    }

    return await this.instructorAppRepo.createApplication({
      user: userId,
      ...applicationData,
    });
  }

  async updateApplication(
    applicationId: string,
    data: any
  ): Promise<IInstructorApplication> {


    const application = await this.instructorAppRepo.getApplicationById(
      applicationId
    );
    if (!application) throw new NotFoundError("Application not found");

    const updatedApplication = await this.instructorAppRepo.updateApplication(
      applicationId,
      {
        ...data,
        status: "pending",
        rejectionReason: null,
      }
    );
    if (!updatedApplication) throw new Error("Failed to update application");

    return updatedApplication;
  }

  async getInstructorApplications(
    page: number,
    limit: number
  ): Promise<{
    applications: IInstructorApplication[];
    totalPages: number;
  }> {
    const { applications, totalPages } =
      await this.instructorAppRepo.getApplications(page, limit);
    return { applications, totalPages };
  }

  async getApplication(
    userId: string | undefined
  ): Promise<IInstructorApplication> {
    if (!userId) throw new BadRequestError("User ID is required");

    const application = await this.instructorAppRepo.getApplication(userId);
    if (!application) throw new NotFoundError("Application not found");
    return application;
  }

  async getApplicationDetails(
    applicationId: string
  ): Promise<IInstructorApplication> {
    const application = await this.instructorAppRepo.getApplicationById(
      applicationId
    );
    if (!application) throw new NotFoundError("Application not found");
    return application;
  }

  async reviewApplication(
    applicationId: string,
    status: "approved" | "rejected",
    rejectionReason?: string
  ): Promise<IInstructorApplication> {
    const application = await this.instructorAppRepo.getApplicationById(
      applicationId
    );
    if (!application) throw new NotFoundError("Application not found");

    const updatedApplication =
      await this.instructorAppRepo.updateApplicationStatus(
        applicationId,
        status,
        rejectionReason
      );
    if (!updatedApplication) throw new Error("Failed to update application");

    if (status === "approved") {
      await this.userRepo.updateUserRole(
        application.user.toString(),
        "instructor"
      );
    }

    return updatedApplication;
  }
}
