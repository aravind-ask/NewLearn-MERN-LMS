import { Request } from "express";

export interface CustomRequest<T = any> extends Request {
  user?: {
    id: string;
    role: "student" | "instructor" | "admin";
  };
  body: T;
}
