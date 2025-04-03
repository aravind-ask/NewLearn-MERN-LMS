"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateController = void 0;
const certificate_dto_1 = require("../utils/certificate.dto");
const responseHandler_1 = require("../utils/responseHandler");
const statusCodes_1 = require("../utils/statusCodes");
class CertificateController {
    constructor(certificateService) {
        this.certificateService = certificateService;
    }
    generateCertificate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const certificateData = certificate_dto_1.CreateCertificateDto.parse(req.body);
                certificateData.userId = req.user.id;
                const certificate = yield this.certificateService.generateCertificate(certificateData);
                (0, responseHandler_1.successResponse)(res, certificate, "Certificate generated successfully", statusCodes_1.HttpStatus.CREATED);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error, error.status || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    getUserCertificates(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const certificates = yield this.certificateService.getUserCertificates(req.user.id);
                (0, responseHandler_1.successResponse)(res, certificates, "Certificates fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error, error.status || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    verifyCertificate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { certificateId } = req.params;
                const certificate = yield this.certificateService.verifyCertificate(certificateId);
                if (!certificate) {
                    (0, responseHandler_1.errorResponse)(res, "Certificate not found", statusCodes_1.HttpStatus.NOT_FOUND);
                    return;
                }
                (0, responseHandler_1.successResponse)(res, {
                    userId: certificate.userId,
                    userName: certificate.userName,
                    courseTitle: certificate.courseTitle,
                    completionDate: certificate.completionDate,
                    certificateId: certificate.certificateId,
                    verified: true,
                }, "Certificate verified successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error, error.status || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
}
exports.CertificateController = CertificateController;
