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
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyOffersToCourses = void 0;
const Offers_1 = require("../models/Offers"); // Assuming an Offer model exists
const applyOffersToCourses = (courses) => __awaiter(void 0, void 0, void 0, function* () {
    const activeOffers = yield Offers_1.Offer.find({
        endDate: { $gte: new Date() },
        startDate: { $lte: new Date() },
    });
    return courses.map((course) => {
        const applicableOffer = activeOffers.find((offer) => offer.applicableCourses.includes(course._id));
        if (applicableOffer) {
            const discount = course.pricing * (applicableOffer.discountPercentage / 100);
            course.discountedPrice = Math.max(course.pricing - discount, 0);
            course.appliedOffer = {
                offerId: applicableOffer._id,
                title: applicableOffer.title,
                discountPercentage: applicableOffer.discountPercentage,
                endDate: applicableOffer.endDate,
            };
        }
        return course;
    });
});
exports.applyOffersToCourses = applyOffersToCourses;
