// src/repositories/InstructorApplicationRepository.ts
import {
  InstructorApplication,
  IInstructorApplication,
} from "../models/InstructorApplication";
import { IInstructorApplicationRepository } from "./interfaces/IInstructorApplicationRepository";
import { BaseRepository } from "./base.repository";
import { Types } from "mongoose";

export class InstructorApplicationRepository
  extends BaseRepository<IInstructorApplication>
  implements IInstructorApplicationRepository
{
  constructor() {
    super(InstructorApplication);
  }

  async createApplication(
    data: Partial<IInstructorApplication>
  ): Promise<IInstructorApplication> {
    try {
      return await this.create(data);
    } catch (error) {
      console.error("Error creating instructor application:", error);
      throw new Error("Error creating instructor application");
    }
  }

  async updateApplication(
    applicationId: string,
    data: Partial<IInstructorApplication>
  ): Promise<IInstructorApplication> {
    try {
      const application = await this.update(applicationId, data);
      if (!application) {
        throw new Error("Application not found");
      }
      return application;
    } catch (error) {
      console.error("Error updating instructor application:", error);
      throw new Error("Error updating instructor application");
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
      const applications = await this.model
        .find()
        .skip(skip)
        .limit(limit)
        .exec();
      const totalApplications = await this.model.countDocuments();
      const totalPages = Math.ceil(totalApplications / limit);

      return { applications, totalPages, totalApplications };
    } catch (error) {
      console.error("Error fetching instructor applications:", error);
      throw new Error("Error fetching instructor applications");
    }
  }

  async getApplicationById(
    applicationId: string
  ): Promise<IInstructorApplication | null> {
    try {
      return await this.findById(applicationId);
    } catch (error) {
      console.error("Error fetching application by ID:", error);
      throw new Error("Error fetching application by ID");
    }
  }

  async getApplication(userId: string): Promise<IInstructorApplication | null> {
    try {
      return await this.findOne({ user: new Types.ObjectId(userId) });
    } catch (error) {
      console.error("Error fetching application by user ID:", error);
      throw new Error("Error fetching application by user ID");
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    status: "pending" | "approved" | "rejected",
    rejectionReason?: string
  ): Promise<IInstructorApplication | null> {
    try {
      const application = await this.update(applicationId, {
        status,
        rejectionReason,
      });
      if (!application) {
        throw new Error("Application not found");
      }
      return application;
    } catch (error) {
      console.error("Error updating application status:", error);
      throw new Error("Error updating application status");
    }
  }
}
