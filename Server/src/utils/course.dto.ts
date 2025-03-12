import { z } from "zod";

const LectureDto = z.object({
  title: z.string(),
  videoUrl: z.string(),
  public_id: z.string(),
  freePreview: z.boolean(),
});

const SectionDto = z.object({
  title: z.string(),
  description: z.string(),
  lectures: z.array(LectureDto),
});

// const StudentDto = z.object({
//   studentId: z.string(),
//   studentName: z.string(),
//   studentEmail: z.string(),
// });

export const CreateCourseDto = z.object({
  instructorId: z.string(),
  instructorName: z.string(),
  // date: z.date().default(new Date()),
  title: z.string(),
  category: z.string(),
  level: z.string(),
  primaryLanguage: z.string(),
  subtitle: z.string(),
  description: z.string().optional(),
  image: z.string(),
  pricing: z.number(),
  objectives: z.string(),
  welcomeMessage: z.string(),
  // students: z.array(StudentDto).default([]),
  curriculum: z.array(SectionDto),
});

export const EditCourseDto = CreateCourseDto.extend({
  courseId: z.string(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseDto>;
export type EditCourseInput = z.infer<typeof EditCourseDto>;
