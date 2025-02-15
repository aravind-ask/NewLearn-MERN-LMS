import { z } from "zod";

export const CreateCourseDto = z.object({
  instructorId: z.string(),
  instructorName: z.string(),
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
  curriculum: z.array(
    z.object({
      title: z.string(),
      videoUrl: z.string(),
      freePreview: z.boolean(),
      public_id: z.string(),
    })
  ),
});

export const EditCourseDto = CreateCourseDto.extend({
  courseId: z.string(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseDto>;
export type EditCourseInput = z.infer<typeof EditCourseDto>;
