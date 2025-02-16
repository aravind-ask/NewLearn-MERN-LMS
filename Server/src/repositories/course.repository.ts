import { ParsedQs } from "qs";
import { Course } from "../models/Course";
import { ICourse } from "../models/Course";
import { CreateCourseInput } from "../utils/course.dto";

interface InstructorCoursesResult {
  courses: ICourse[];
  totalCourses: number;
}

export class CourseRepository {
  async createCourse(data: CreateCourseInput): Promise<ICourse> {
    return await Course.create(data);
  }

  async findCourseById(courseId: string): Promise<ICourse | null> {
    return await Course.findById(courseId);
  }

  async updateCourse(
    courseId: string,
    data: Partial<ICourse>
  ): Promise<ICourse | null> {
    return await Course.findByIdAndUpdate(courseId, data, { new: true });
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
    const query: any = {};

    // Search by course title
    if (search) {
      query.title = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    // Filter by category & difficulty
    if (category) query.category = category;
    if (difficulty) query.level = difficulty;

    // Sorting logic
    const sortField = sortBy === "price" ? "pricing" : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    // Pagination logic
    const courses = await Course.find(query)
      .sort({ [sortField]: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCourses = await Course.countDocuments(query);

    return { courses, totalCourses };
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
    const skip = (page - 1) * limit;

    const courses = await Course.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCourses = await Course.countDocuments(filter);

    return { courses, totalCourses };
  }

  async deleteCourse(courseId: string): Promise<ICourse | null> {
    return await Course.findByIdAndDelete(courseId);
  }
}
