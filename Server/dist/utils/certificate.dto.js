"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCertificateDto = void 0;
// src/utils/certificate.dto.ts
const zod_1 = require("zod");
exports.CreateCertificateDto = zod_1.z.object({
    userId: zod_1.z.string(),
    userName: zod_1.z.string(),
    courseId: zod_1.z.string(),
    courseTitle: zod_1.z.string(),
    completionDate: zod_1.z.string().transform((val) => new Date(val)),
});
