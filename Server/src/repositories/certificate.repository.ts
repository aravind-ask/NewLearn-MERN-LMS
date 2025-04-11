// src/repositories/CertificateRepository.ts
import Certificate, { ICertificate } from "../models/Certificate";
import { ICertificateRepository } from "./interfaces/ICertificateRepository";
import { BaseRepository } from "./base.repository";
import { CreateCertificateInput } from "../utils/certificate.dto";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

export class CertificateRepository
  extends BaseRepository<ICertificate>
  implements ICertificateRepository
{
  constructor() {
    super(Certificate);
  }

  async create(certificate: CreateCertificateInput): Promise<ICertificate> {
    try {
      const certificateId = uuidv4();
      const verificationUrl = `${process.env.CLIENT_URL}/verify-certificate/${certificateId}`;
      const certificateData = {
        ...certificate,
        certificateId,
        verificationUrl,
      };
      return await super.create(certificateData);
    } catch (error) {
      console.error("Error creating certificate:", error);
      throw new Error("Failed to create certificate");
    }
  }

  async findByUserId(userId: string): Promise<ICertificate[]> {
    try {
      const certificates = await this.model.find({ userId }).lean().exec();
      return certificates;
    } catch (error) {
      console.error("Error finding certificates by user ID:", error);
      throw new Error("Failed to find certificates by user ID");
    }
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<ICertificate | null> {
    try {
      return await this.findOne({ userId, courseId });
    } catch (error) {
      console.error("Error finding certificate by user and course:", error);
      throw new Error("Failed to find certificate by user and course");
    }
  }

  async findByCertificateId(
    certificateId: string
  ): Promise<ICertificate | null> {
    try {
      return await this.findOne({ certificateId });
    } catch (error) {
      console.error("Error finding certificate by certificate ID:", error);
      throw new Error("Failed to find certificate by certificate ID");
    }
  }
}
