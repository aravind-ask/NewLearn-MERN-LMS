import { Course } from "../models/Course";
import { ICourse } from "../models/Course";
import { CreateCourseInput } from "../utils/course.dto";

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

  async deleteCourse(courseId: string): Promise<ICourse | null> {
    return await Course.findByIdAndDelete(courseId);
  }
}
