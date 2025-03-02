// src/repositories/InstructorApplicationRepository.ts
import {
  InstructorApplication,
  IInstructorApplication,
} from "../models/InstructorApplication";
import { IInstructorApplicationRepository } from "./interfaces/IInstructorApplicationRepository";

export class InstructorApplicationRepository
  implements IInstructorApplicationRepository
{
  async createApplication(
    data: Partial<IInstructorApplication>
  ): Promise<IInstructorApplication> {
    try {
      return await InstructorApplication.create(data);
    } catch (error) {
      throw new Error("Error creating instructor application");
    }
  }

  async getApplications(
    page: number,
    limit: number
  ): Promise<{
    applications: IInstructorApplication[];
    totalPages: number;
    totalApplications: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const applications = await InstructorApplication.find()
        .skip(skip)
        .limit(limit)
        .exec();

      const totalApplications = await InstructorApplication.countDocuments();
      const totalPages = Math.ceil(totalApplications / limit);

      return { applications, totalPages, totalApplications };
    } catch (error) {
      throw new Error("Error fetching instructor applications");
    }
  }

  async getApplicationById(
    applicationId: string
  ): Promise<IInstructorApplication | null> {
    try {
      return await InstructorApplication.findById(applicationId).exec();
    } catch (error) {
      throw new Error("Error fetching application by ID");
    }
  }

  async getApplication(userId: string): Promise<IInstructorApplication | null> {
    try {
      return await InstructorApplication.findOne({ user: userId }).exec();
    } catch (error) {
      throw new Error("Error fetching application by user ID");
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    rejectionReason?: string
  ): Promise<IInstructorApplication | null> {
    try {
      return await InstructorApplication.findByIdAndUpdate(
        applicationId,
        { status, rejectionReason },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error("Error updating application status");
    }
  }
}
