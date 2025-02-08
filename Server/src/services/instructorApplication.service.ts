import { InstructorApplicationRepository } from "../repositories/InstructorApplicationRepository";
import { BadRequestError, NotFoundError } from "../utils/customError";
import { userRepository } from "../repositories/userRepository";

const instructorApplicationRepository = new InstructorApplicationRepository();

export class InstructorApplicationService {
  async applyForInstructor(userId: string | undefined, applicationData: any) {
    const existingApplication =
      await instructorApplicationRepository.getApplicationById(userId);
    if (existingApplication)
      throw new BadRequestError(
        "You have already applied for instructor verification."
      );

    return await instructorApplicationRepository.createApplication({
      user: userId,
      ...applicationData,
    });
  }

  async getInstructorApplications(page: number, limit: number) {
    return await instructorApplicationRepository.getApplications(
      Number(page),
      Number(limit)
    );
  }

  async getApplication(userId: string | undefined) {
    const application =
      await instructorApplicationRepository.getApplication(userId);
    if (!application) throw new NotFoundError("Application not found");
    return application;
  }

  async reviewApplication(
    applicationId: string,
    status: "approved" | "rejected",
    rejectionReason?: string
  ) {
    const application =
      await instructorApplicationRepository.getApplicationById(applicationId);
    if (!application) throw new NotFoundError("Application not found");

    const updatedApplication =
      await instructorApplicationRepository.updateApplicationStatus(
        applicationId,
        status,
        rejectionReason
      );

    if (status === "approved") {
      await userRepository.updateUserRole(
        application.user.toString(),
        "instructor"
      );
    }

    return updatedApplication;
  }
}
