// src/controllers/CertificateController.ts
import { NextFunction, Request, Response } from "express";
import {
  CreateCertificateDto,
  CreateCertificateInput,
} from "../utils/certificate.dto";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { HttpStatus } from "../utils/statusCodes";
import { ICertificateService } from "../services/interfaces/ICertificateService";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export class CertificateController {
  constructor(private certificateService: ICertificateService) {}

  async generateCertificate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
        return;
      }

      const certificateData: CreateCertificateInput =
        CreateCertificateDto.parse(req.body);
      certificateData.userId = req.user.id;

      const certificate = await this.certificateService.generateCertificate(
        certificateData
      );
      successResponse(
        res,
        certificate,
        "Certificate generated successfully",
        HttpStatus.CREATED
      );
    } catch (error: any) {
      errorResponse(res, error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  async getUserCertificates(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        errorResponse(res, "Unauthorized", HttpStatus.UNAUTHORIZED);
        return;
      }

      const certificates = await this.certificateService.getUserCertificates(
        req.user.id
      );
      successResponse(
        res,
        certificates,
        "Certificates fetched successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(res, error, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  async verifyCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const { certificateId } = req.params;
      const certificate = await this.certificateService.verifyCertificate(
        certificateId
      );

      if (!certificate) {
        errorResponse(res, "Certificate not found", HttpStatus.NOT_FOUND);
        return;
      }

      successResponse(
        res,
        {
          userId: certificate.userId,
          userName: certificate.userName,
          courseTitle: certificate.courseTitle,
          completionDate: certificate.completionDate,
          certificateId: certificate.certificateId,
          verified: true,
        },
        "Certificate verified successfully",
        HttpStatus.OK
      );
    } catch (error: any) {
      errorResponse(res, error, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}
