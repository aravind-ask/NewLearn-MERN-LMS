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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateRepository = void 0;
// src/repositories/CertificateRepository.ts
const Certificate_1 = __importDefault(require("../models/Certificate"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class CertificateRepository {
    create(certificate) {
        return __awaiter(this, void 0, void 0, function* () {
            const certificateId = (0, uuid_1.v4)();
            const verificationUrl = `${process.env.CLIENT_URL}/verify-certificate/${certificateId}`;
            const certificateData = Object.assign(Object.assign({}, certificate), { certificateId,
                verificationUrl });
            return yield Certificate_1.default.create(certificateData);
        });
    }
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Certificate_1.default.find({ userId }).lean();
        });
    }
    findByUserAndCourse(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Certificate_1.default.findOne({ userId, courseId }).lean();
        });
    }
    findByCertificateId(certificateId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Certificate_1.default.findOne({ certificateId }).lean();
        });
    }
}
exports.CertificateRepository = CertificateRepository;
