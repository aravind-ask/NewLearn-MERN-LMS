// src/repositories/interfaces/ICertificateRepository.ts
import { ICertificate } from "../../models/Certificate";
import { CreateCertificateInput } from "../../utils/certificate.dto";

export interface ICertificateRepository {
  create(certificate: CreateCertificateInput): Promise<ICertificate>;
  findByUserId(userId: string): Promise<ICertificate[]>;
  findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<ICertificate | null>;
  findByCertificateId(certificateId: string): Promise<ICertificate | null>;
}
