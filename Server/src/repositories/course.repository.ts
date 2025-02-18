import { ParsedQs } from "qs";
import { Course } from "../models/Course";
import { ICourse } from "../models/Course";
import { CreateCourseInput } from "../utils/course.dto";

interface InstructorCoursesResult {
  courses: ICourse[];
  totalCourses: number;
  totalPages?: number;
}

export class CourseRepository {
  async createCourse(data: CreateCourseInput): Promise<ICourse> {
    try {
      return await Course.create(data);
    } catch (error) {
      console.error("Error creating course:", error);
      throw new Error("Failed to create course");
    }
  }

  async findCourseById(courseId: string): Promise<ICourse | null> {
    try {
      return await Course.findById(courseId);
    } catch (error) {
      console.error("Error finding course by ID:", error);
      throw new Error("Failed to find course by ID");
    }
  }

  async updateCourse(
    courseId: string,
    data: Partial<ICourse>
  ): Promise<ICourse | null> {
    try {
      return await Course.findByIdAndUpdate(courseId, data, { new: true });
    } catch (error) {
      console.error("Error updating course:", error);
      throw new Error("Failed to update course");
    }
  }

  async getAllCourses(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    difficulty?: string,
    sortBy?: string,
    sortOrder: "asc" | "desc" = "desc"
  ): Promise<InstructorCoursesResult | null> {
    try {
      const query: any = {};

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      if (category) query.category = category;
      if (difficulty) query.level = difficulty;

      const sortField = sortBy === "price" ? "pricing" : "createdAt";
      const sortDirection = sortOrder === "asc" ? 1 : -1;

      const courses = await Course.find(query)
        .sort({ [sortField]: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit);

      const totalCourses = await Course.countDocuments(query);
      const totalPages = Math.ceil(totalCourses / limit);

      return { courses, totalCourses, totalPages };
    } catch (error) {
      console.error("Error getting all courses:", error);
      throw new Error("Failed to get all courses");
    }
  }

  async getCourseDetails(courseId: string): Promise<ICourse | null> {
    try {
      return await Course.findById(courseId);
    } catch (error) {
      console.error("Error getting course details:", error);
      throw new Error("Failed to get course details");
    }
  }

  async getInstructorCourses(
    filter: {
      instructorId: string;
      title: {
        $regex: string | ParsedQs | (string | ParsedQs)[];
        $options: string;
      };
    },
    page: number,
    limit: number,
    sortOptions: { [key: string]: 1 | -1 }
  ): Promise<InstructorCoursesResult> {
    try {
      const skip = (page - 1) * limit;

      const courses = await Course.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec();

      const totalCourses = await Course.countDocuments(filter);

      return { courses, totalCourses };
    } catch (error) {
      console.error("Error getting instructor courses:", error);
      throw new Error("Failed to get instructor courses");
    }
  }

  async deleteCourse(courseId: string): Promise<ICourse | null> {
    try {
      return await Course.findByIdAndDelete(courseId);
    } catch (error) {
      console.error("Error deleting course:", error);
      throw new Error("Failed to delete course");
    }
  }
}
