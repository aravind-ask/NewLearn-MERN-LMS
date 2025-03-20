// src/services/CertificateService.ts
import { ICertificateService } from "./interfaces/ICertificateService";
import { ICertificateRepository } from "../repositories/interfaces/ICertificateRepository";
import { ICertificate } from "../models/Certificate";
import { CreateCertificateInput } from "../utils/certificate.dto";

export class CertificateService implements ICertificateService {
  constructor(private certificateRepository: ICertificateRepository) {}

  async generateCertificate(
    data: CreateCertificateInput
  ): Promise<ICertificate> {
    const existingCertificate =
      await this.certificateRepository.findByUserAndCourse(
        data.userId,
        data.courseId
      );

    if (existingCertificate) {
      return existingCertificate;
    }

    return await this.certificateRepository.create(data);
  }

  async getUserCertificates(userId: string): Promise<ICertificate[]> {
    return await this.certificateRepository.findByUserId(userId);
  }

  async getCertificateByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<ICertificate | null> {
    return await this.certificateRepository.findByUserAndCourse(
      userId,
      courseId
    );
  }

  async verifyCertificate(certificateId: string): Promise<ICertificate | null> {
    return await this.certificateRepository.findByCertificateId(certificateId);
  }
}
