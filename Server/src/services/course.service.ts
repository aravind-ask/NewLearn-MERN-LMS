import { ParsedQs } from "qs";
import { CourseRepository } from "../repositories/course.repository";
import { CreateCourseInput, EditCourseInput } from "../utils/course.dto";
import { ICourse } from "../models/Course";

export class CourseService {
  private courseRepo: CourseRepository;

  constructor() {
    this.courseRepo = new CourseRepository();
  }

  async createCourse(data: CreateCourseInput): Promise<ICourse> {
    return await this.courseRepo.createCourse(data);
  }

  async editCourse(data: EditCourseInput): Promise<ICourse | null> {
    const { courseId, ...updateData } = data;
    return await this.courseRepo.updateCourse(courseId, updateData);
  }
  async getAllCourses(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    difficulty?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) {
    return await this.courseRepo.getAllCourses(
      page,
      limit,
      search,
      category,
      difficulty,
      sortBy,
      sortOrder
    );
  }

  async fetchInstructorCourses(
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
  ) {
    if (!filter.instructorId) {
      throw new Error("Instructor ID is required");
    }

    const { courses, totalCourses } =
      await this.courseRepo.getInstructorCourses(
        filter,
        page,
        limit,
        sortOptions
      );

    return {
      courses,
      totalCourses,
      totalPages: Math.ceil(totalCourses / limit),
      currentPage: page,
    };
  }

  async deleteCourse(courseId: string): Promise<ICourse | null> {
    return await this.courseRepo.deleteCourse(courseId);
  }
}
