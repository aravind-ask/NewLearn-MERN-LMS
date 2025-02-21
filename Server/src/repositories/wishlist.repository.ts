import { Wishlist, IWishlist } from "../models/Wishlist";
import { Course } from "../types/types";

export const addToWishlist = async (
  userId: string,
  courseId: string
): Promise<Course> => {
  const existingWishlistItem = await Wishlist.findOne({ userId, courseId });
  if (existingWishlistItem) {
    throw new Error("Course already in wishlist");
  }
  const wishlistItem = new Wishlist({ userId, courseId });
  await wishlistItem.save();
  const populatedWishlistItem = await Wishlist.findById(wishlistItem._id)
    .populate<{ courseId: Course }>("courseId")
    .exec();
  return populatedWishlistItem!.courseId;
};

export const removeFromWishlist = async (
  userId: string,
  courseId: string
): Promise<void> => {
  await Wishlist.findOneAndDelete({ userId, courseId });
};

export const getWishlist = async (userId: string): Promise<Course[]> => {
  const wishlistItems = await Wishlist.find({ userId }).populate<{
    courseId: Course;
  }>("courseId");
  return wishlistItems.map((item) => item.courseId);
};
