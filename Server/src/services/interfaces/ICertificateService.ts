// src/services/interfaces/ICertificateService.ts
import { ICertificate } from "../../models/Certificate";
import { CreateCertificateInput } from "../../utils/certificate.dto";

export interface ICertificateService {
  generateCertificate(data: CreateCertificateInput): Promise<ICertificate>;
  getUserCertificates(userId: string): Promise<ICertificate[]>;
  getCertificateByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<ICertificate | null>;
  verifyCertificate(certificateId: string): Promise<ICertificate | null>;
}
