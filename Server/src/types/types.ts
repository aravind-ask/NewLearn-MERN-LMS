export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Course {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  pricing: number;
  instructorName: string;
  primaryLanguage: string;
  students: string[];
  curriculum: CurriculumItem[];
}

export interface CurriculumItem {
  title: string;
  freePreview: boolean;
  videoUrl: string;
}

export interface CartItem {
  _id: string;
  userId: string;
  courseId: Course;
  addedAt: Date;
}

export interface WishlistItem {
  _id: string;
  userId: string;
  courseId: Course;
  addedAt: Date;
}
