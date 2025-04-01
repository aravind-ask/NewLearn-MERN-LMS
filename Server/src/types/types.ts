// src/types/course.types.ts
export interface Course {
  courseId: string;
}

export interface Offer {
  _id: string;
  title: string;
  description: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    _id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface CartItem {
  course: Course;
  offer: Offer;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}


export interface Interview {
  id: string;
  position: string;
  description: string;
  experience: number;
  userId: string;
  techStack: string;
  questions: { question: string; answer: string }[];
  createdAt: Date | string;
  updatedAt: Date | string;
}