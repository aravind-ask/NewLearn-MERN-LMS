import { Cart, ICart } from "../models/Cart";
import { Course } from "../types/types";

export const addToCart = async (
  userId: string,
  courseId: string
): Promise<Course> => {
  const existingCartItem = await Cart.findOne({ userId, courseId });
  if (existingCartItem) {
    throw new Error("Course already in cart");
  }
  const cartItem = new Cart({ userId, courseId });
  await cartItem.save();
  const populatedCartItem = await Cart.findById(cartItem._id)
    .populate<{ courseId: Course }>("courseId")
    .exec();
  return populatedCartItem!.courseId;
};

export const removeFromCart = async (
  userId: string,
  courseId: string
): Promise<void> => {
  await Cart.findOneAndDelete({ userId, courseId });
};

export const getCart = async (userId: string): Promise<Course[]> => {
  const cartItems = await Cart.find({ userId }).populate<{ courseId: Course }>(
    "courseId"
  );
  return cartItems.map((item) => item.courseId);
};
