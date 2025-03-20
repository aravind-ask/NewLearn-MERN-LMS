// src/routes/certificateRoutes.ts
import { Router } from "express";
import { CertificateController } from "../Controllers/certificate.controller";
import { CertificateService } from "../services/certificate.service";
import { CertificateRepository } from "../repositories/certificate.repository";
import { authMiddleware } from "../middlewares/auth.middleware";

// Dependency Injection
const certificateRepository = new CertificateRepository();
const certificateService = new CertificateService(certificateRepository);
const certificateController = new CertificateController(certificateService);

const router = Router();

router.post(
  "/",
  authMiddleware.verifyAccessToken,
  certificateController.generateCertificate.bind(certificateController)
);

router.get(
  "/:userId",
  authMiddleware.verifyAccessToken,
  certificateController.getUserCertificates.bind(certificateController)
);

export default router;
