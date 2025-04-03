"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditCourseDto = exports.CreateCourseDto = void 0;
const zod_1 = require("zod");
const LectureDto = zod_1.z.object({
    title: zod_1.z.string(),
    videoUrl: zod_1.z.string(),
    public_id: zod_1.z.string(),
    freePreview: zod_1.z.boolean(),
});
const SectionDto = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    lectures: zod_1.z.array(LectureDto),
});
// const StudentDto = z.object({
//   studentId: z.string(),
//   studentName: z.string(),
//   studentEmail: z.string(),
// });
exports.CreateCourseDto = zod_1.z.object({
    instructorId: zod_1.z.string(),
    instructorName: zod_1.z.string(),
    // date: z.date().default(new Date()),
    title: zod_1.z.string(),
    category: zod_1.z.string(),
    level: zod_1.z.string(),
    primaryLanguage: zod_1.z.string(),
    subtitle: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    image: zod_1.z.string(),
    pricing: zod_1.z.number(),
    objectives: zod_1.z.string(),
    welcomeMessage: zod_1.z.string(),
    // students: z.array(StudentDto).default([]),
    curriculum: zod_1.z.array(SectionDto),
});
exports.EditCourseDto = exports.CreateCourseDto.extend({
    courseId: zod_1.z.string(),
});
