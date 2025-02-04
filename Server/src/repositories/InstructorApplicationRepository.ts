import {
  InstructorApplication,
  IInstructorApplication,
} from "../models/InstructorApplication";

export class InstructorApplicationRepository {
  async createApplication(applicationData: Partial<IInstructorApplication>) {
    return await InstructorApplication.create(applicationData);
  }

  async getApplications(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const applications = await InstructorApplication.find()
        .skip(skip)
        .limit(limit);

      const totalApplications = await InstructorApplication.countDocuments();

      return {
        applications,
        totalPages: Math.ceil(totalApplications / limit),
        totalApplications,
      };
    } catch (error) {
      throw new Error("Error fetching instructor applications");
    }
  }

  async getApplicationById(applicationId: string | undefined) {
    return await InstructorApplication.findById(applicationId);
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    rejectionReason?: string
  ) {
    return await InstructorApplication.findByIdAndUpdate(
      applicationId,
      { status, rejectionReason },
      { new: true }
    );
  }
}
