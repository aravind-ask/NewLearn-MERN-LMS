// src/services/course.service.ts
import { ICourseRepository } from "../repositories/interfaces/ICourseRepository";
import { ICourse } from "../models/Course";
import { IOffer } from "../models/Offers";
import { ICourseService } from "./interfaces/ICourseService";
import { CreateCourseInput, EditCourseInput } from "../utils/course.dto";
import mongoose from "mongoose";
import { IOfferService } from "./interfaces/IOfferService";

interface CourseWithOffer extends ICourse {
  discountedPrice?: number;
  appliedOffer?: IOffer;
}

export class CourseService implements ICourseService {
  constructor(
    private courseRepo: ICourseRepository,
    private offerService: IOfferService
  ) {}

  async createCourse(courseCreationData: CreateCourseInput): Promise<ICourse> {
    return await this.courseRepo.createCourse(courseCreationData);
  }

  async editCourse(courseEditData: EditCourseInput): Promise<ICourse | null> {
    const { courseId, ...updateData } = courseEditData;
    const courseData = {
      ...courseEditData,
      category: new mongoose.Types.ObjectId(courseEditData.category),
    };
    return await this.courseRepo.updateCourse(courseId, courseData);
  }

  async updateCourseEnrollment(
    courseId: string,
    data: {
      studentId: string;
      studentName: string;
      studentEmail: string;
      paidAmount: number;
    }
  ): Promise<ICourse | null> {
    return await this.courseRepo.updateCourseEnrollment(courseId, data);
  }

  private async getBestOfferForCourse(course: ICourse): Promise<{
    offer: IOffer | null;
    discountedPrice: number | null;
  }> {
    const offers = await this.offerService.getOffers(1, 100);

    const activeOffers = offers.filter(
      (offer) =>
        offer.isActive &&
        new Date(offer.startDate) <= new Date() &&
        new Date(offer.endDate) >= new Date()
    );

    const globalOffers = activeOffers.filter((offer) => !offer.category);
    const categoryOffers = course.category
      ? activeOffers.filter(
          (offer) =>
            offer.category &&
            offer.category.toString() === course.category.toString()
        )
      : [];

    const applicableOffers = [...globalOffers, ...categoryOffers];

    if (!applicableOffers.length) {
      return { offer: null, discountedPrice: null };
    }

    const bestOffer = applicableOffers.reduce((prev, current) =>
      prev.discountPercentage > current.discountPercentage ? prev : current
    );

    const discountedPrice = course.pricing
      ? Math.round(course.pricing * (1 - bestOffer.discountPercentage / 100))
      : null;

    return { offer: bestOffer, discountedPrice };
  }

  async getAllCourses(
    page: number,
    limit: number,
    search?: string,
    category?: string,
    difficulty?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    excludeInstructorId?: string
  ): Promise<{
    courses: CourseWithOffer[];
    totalCourses: number;
    totalPages?: number;
  }> {
    const result = await this.courseRepo.getAllCourses(
      page,
      limit,
      search,
      category,
      difficulty,
      sortBy,
      sortOrder,
      excludeInstructorId
    );
    const coursesWithOffers = await Promise.all(
      result.courses.map(async (course) => {
        const { offer, discountedPrice } = await this.getBestOfferForCourse(
          course
        );
        return {
          ...course.toObject(),
          discountedPrice,
          appliedOffer: offer,
        };
      })
    );

    return {
      courses: coursesWithOffers,
      totalCourses: result.totalCourses,
      totalPages: result.totalPages,
    };
  }

  async getCourseDetails(courseId: string): Promise<CourseWithOffer | null> {
    const course = await this.courseRepo.getCourseDetails(courseId);
    if (!course) return null;

    const { offer, discountedPrice } = await this.getBestOfferForCourse(course);

    return {
      ...course.toObject(),
      discountedPrice,
      appliedOffer: offer,
    };
  }

  async fetchInstructorCourses(
    filter: { instructorId: string; title: any },
    page: number,
    limit: number,
    sortOptions: { [key: string]: 1 | -1 }
  ): Promise<{
    courses: ICourse[];
    totalCourses: number;
    totalPages: number;
    currentPage: number;
  }> {
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
