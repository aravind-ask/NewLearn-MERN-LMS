import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const dbUri = process.env.MONGO_URI as string;
    await mongoose.connect(dbUri);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};
