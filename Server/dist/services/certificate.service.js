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
exports.CertificateService = void 0;
class CertificateService {
    constructor(certificateRepository) {
        this.certificateRepository = certificateRepository;
    }
    generateCertificate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingCertificate = yield this.certificateRepository.findByUserAndCourse(data.userId, data.courseId);
            if (existingCertificate) {
                return existingCertificate;
            }
            return yield this.certificateRepository.create(data);
        });
    }
    getUserCertificates(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.certificateRepository.findByUserId(userId);
        });
    }
    getCertificateByUserAndCourse(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.certificateRepository.findByUserAndCourse(userId, courseId);
        });
    }
    verifyCertificate(certificateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.certificateRepository.findByCertificateId(certificateId);
        });
    }
}
exports.CertificateService = CertificateService;
