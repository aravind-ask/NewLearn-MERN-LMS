// utils/offerUtils.ts
import { Course } from "../types/types";
import { Offer } from "../models/Offers"; // Assuming an Offer model exists

export const applyOffersToCourses = async (
  courses: Course[]
): Promise<Course[]> => {
  const activeOffers = await Offer.find({
    endDate: { $gte: new Date() },
    startDate: { $lte: new Date() },
  });

  return courses.map((course) => {
    const applicableOffer = activeOffers.find((offer) =>
      offer.applicableCourses.includes(course._id)
    );

    if (applicableOffer) {
      const discount =
        course.pricing * (applicableOffer.discountPercentage / 100);
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
};
