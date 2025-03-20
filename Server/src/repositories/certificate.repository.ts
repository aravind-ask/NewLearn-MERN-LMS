
// src/repositories/CertificateRepository.ts
import Certificate, { ICertificate } from "../models/Certificate";
import { ICertificateRepository } from "./interfaces/ICertificateRepository";
import { CreateCertificateInput } from "../utils/certificate.dto";
import { v4 as uuidv4 } from "uuid";

export class CertificateRepository implements ICertificateRepository {
  async create(certificate: CreateCertificateInput): Promise<ICertificate> {
    const certificateData = {
      ...certificate,
      certificateId: uuidv4(),
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
}
