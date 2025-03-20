// src/repositories/CertificateRepository.ts
import Certificate, { ICertificate } from "../models/Certificate";
import { ICertificateRepository } from "./interfaces/ICertificateRepository";
import { CreateCertificateInput } from "../utils/certificate.dto";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

export class CertificateRepository implements ICertificateRepository {
  async create(certificate: CreateCertificateInput): Promise<ICertificate> {
    const certificateId = uuidv4();
    const verificationUrl = `${process.env.CLIENT_URL}/verify-certificate/${certificateId}`;
    const certificateData = {
      ...certificate,
      certificateId,
      verificationUrl,
    };
    return await Certificate.create(certificateData);
  }

  async findByUserId(userId: string): Promise<ICertificate[]> {
    return await Certificate.find({ userId }).lean();
  }

  async findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<ICertificate | null> {
    return await Certificate.findOne({ userId, courseId }).lean();
  }
  async findByCertificateId(
    certificateId: string
  ): Promise<ICertificate | null> {
    return await Certificate.findOne({ certificateId }).lean();
  }
}
