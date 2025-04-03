"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/certificateRoutes.ts
const express_1 = require("express");
const certificate_controller_1 = require("../Controllers/certificate.controller");
const certificate_service_1 = require("../services/certificate.service");
const certificate_repository_1 = require("../repositories/certificate.repository");
const auth_middleware_1 = require("../middlewares/auth.middleware");
// Dependency Injection
const certificateRepository = new certificate_repository_1.CertificateRepository();
const certificateService = new certificate_service_1.CertificateService(certificateRepository);
const certificateController = new certificate_controller_1.CertificateController(certificateService);
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authMiddleware.verifyAccessToken, certificateController.generateCertificate.bind(certificateController));
router.get("/:userId", auth_middleware_1.authMiddleware.verifyAccessToken, certificateController.getUserCertificates.bind(certificateController));
router.get("/verify/:certificateId", certificateController.verifyCertificate.bind(certificateController));
exports.default = router;
