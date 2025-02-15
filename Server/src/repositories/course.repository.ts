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

  async getInstructorCourses(
    instructorId: string,
    page: number,
    limit: number,
    sortOptions: { [key: string]: 1 | -1 }
  ): Promise<InstructorCoursesResult> {
    const skip = (page - 1) * limit;

    const courses = await Course.find({ instructorId })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCourses = await Course.countDocuments({ instructorId });

    return { courses, totalCourses };
  }

  async deleteCourse(courseId: string): Promise<ICourse | null> {
    return await Course.findByIdAndDelete(courseId);
  }
}
