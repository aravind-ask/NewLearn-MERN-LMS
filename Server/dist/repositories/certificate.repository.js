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
const base_repository_1 = require("./base.repository");
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class CertificateRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Certificate_1.default);
    }
    create(certificate) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const certificateId = (0, uuid_1.v4)();
                const verificationUrl = `${process.env.CLIENT_URL}/verify-certificate/${certificateId}`;
                const certificateData = Object.assign(Object.assign({}, certificate), { certificateId,
                    verificationUrl });
                return yield _super.create.call(this, certificateData);
            }
            catch (error) {
                console.error("Error creating certificate:", error);
                throw new Error("Failed to create certificate");
            }
        });
    }
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const certificates = yield this.model.find({ userId }).lean().exec();
                return certificates;
            }
            catch (error) {
                console.error("Error finding certificates by user ID:", error);
                throw new Error("Failed to find certificates by user ID");
            }
        });
    }
    findByUserAndCourse(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.findOne({ userId, courseId });
            }
            catch (error) {
                console.error("Error finding certificate by user and course:", error);
                throw new Error("Failed to find certificate by user and course");
            }
        });
    }
    findByCertificateId(certificateId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.findOne({ certificateId });
            }
            catch (error) {
                console.error("Error finding certificate by certificate ID:", error);
                throw new Error("Failed to find certificate by certificate ID");
            }
        });
    }
}
exports.CertificateRepository = CertificateRepository;
