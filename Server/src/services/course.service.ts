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

  async deleteCourse(courseId: string): Promise<ICourse | null> {
    return await this.courseRepo.deleteCourse(courseId);
  }
}
