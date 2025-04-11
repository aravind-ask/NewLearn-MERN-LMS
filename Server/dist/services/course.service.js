"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class CourseService {
    constructor(courseRepo, offerService) {
        this.courseRepo = courseRepo;
        this.offerService = offerService;
    }
    createCourse(courseCreationData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.courseRepo.createCourse(courseCreationData);
        });
    }
    editCourse(courseEditData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { courseId } = courseEditData, updateData = __rest(courseEditData, ["courseId"]);
            const courseData = Object.assign(Object.assign({}, courseEditData), { category: new mongoose_1.default.Types.ObjectId(courseEditData.category) });
            // @ts-ignore: Temporarily bypass type checking for this call
            return yield this.courseRepo.updateCourse(courseId, courseData);
        });
    }
    updateCourseEnrollment(courseId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.courseRepo.updateCourseEnrollment(courseId, data);
        });
    }
    getBestOfferForCourse(course) {
        return __awaiter(this, void 0, void 0, function* () {
            const offers = yield this.offerService.getOffers(1, 100);
            // Access the 'offers' array from the returned object
            const activeOffers = offers.items.filter((offer) => offer.isActive &&
                new Date(offer.startDate) <= new Date() &&
                new Date(offer.endDate) >= new Date());
            const globalOffers = activeOffers.filter((offer) => !offer.category);
            const categoryOffers = course.category
                ? activeOffers.filter((offer) => offer.category &&
                    offer.category.toString() === course.category.toString())
                : [];
            const applicableOffers = [...globalOffers, ...categoryOffers];
            if (!applicableOffers.length) {
                return { offer: null, discountedPrice: null };
            }
            const bestOffer = applicableOffers.reduce((prev, current) => prev.discountPercentage > current.discountPercentage ? prev : current);
            const discountedPrice = course.pricing
                ? Math.round(course.pricing * (1 - bestOffer.discountPercentage / 100))
                : null;
            return { offer: bestOffer, discountedPrice };
        });
    }
    getAllCourses(page, limit, search, category, difficulty, sortBy, sortOrder, excludeInstructorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.courseRepo.getAllCourses(page, limit, search, category, difficulty, sortBy, sortOrder, excludeInstructorId);
            const coursesWithOffers = yield Promise.all(result.courses.map((course) => __awaiter(this, void 0, void 0, function* () {
                const { offer, discountedPrice } = yield this.getBestOfferForCourse(course);
                return Object.assign(Object.assign({}, course.toObject()), { discountedPrice, appliedOffer: offer });
            })));
            return {
                courses: coursesWithOffers,
                totalCourses: result.totalCourses,
                totalPages: result.totalPages,
            };
        });
    }
    getCourseDetails(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield this.courseRepo.getCourseDetails(courseId);
            if (!course)
                return null;
            const { offer, discountedPrice } = yield this.getBestOfferForCourse(course);
            return Object.assign(Object.assign({}, course.toObject()), { discountedPrice, appliedOffer: offer });
        });
    }
    fetchInstructorCourses(filter, page, limit, sortOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const { courses, totalCourses } = yield this.courseRepo.getInstructorCourses(filter, page, limit, sortOptions);
            return {
                courses,
                totalCourses,
                totalPages: Math.ceil(totalCourses / limit),
                currentPage: page,
            };
        });
    }
    deleteCourse(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.courseRepo.deleteCourse(courseId);
        });
    }
}
exports.CourseService = CourseService;
