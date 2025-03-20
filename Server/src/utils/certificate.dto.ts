// src/utils/certificate.dto.ts
import { z } from "zod";

export const CreateCertificateDto = z.object({
  userId: z.string(),
  userName: z.string(),
  courseId: z.string(),
  courseTitle: z.string(),
  completionDate: z.string().transform((val) => new Date(val)),
});

export type CreateCertificateInput = z.infer<typeof CreateCertificateDto>;
