import { Request, Response } from "express";
import UserService from "../services/user.service";
import { getPresignedUrl } from "../config/s3.config";
import { errorResponse, successResponse } from "../utils/responseHandler";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { fetchEnrolledCourses } from "../services/enrollment.service";
import { User } from "../models/User";

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const getUploadUrl = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.body;
    const url = await getPresignedUrl(fileName);
    res.json({
      url,
      key: `uploads/${uuidv4()}-${Date.now()}-${fileName}`,
    });
  } catch (error) {
    console.error("S3 URL Error:", error);
    res.status(500).json({ message: "Error generating upload URL" });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      photoUrl,
      bio,
      phoneNumber,
      address,
      dateOfBirth,
      education,
    } = req.body;
    console.log("photp", req.body.photoUrl);
    if (!req.user) {
      errorResponse(res, "Unauthorized", 401);
      return;
    }
    console.log("req.user", req.user);

    const updatedUser = await UserService.updateProfile(
      req.user.id,
      name,
      email,
      password,
      photoUrl,
      bio,
      phoneNumber,
      address,
      dateOfBirth,
      education
    );

    if (!updatedUser) {
      errorResponse(res, "User not found", 404);
      return;
    }

    const user = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      photoUrl: updatedUser.photoUrl,
      bio: updatedUser.bio,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      dateOfBirth: updatedUser.dateOfBirth,
      education: updatedUser.education,
      isBlocked: updatedUser.isBlocked,
    };
    successResponse(res, user, "Profile updated successfully!", 200);
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    errorResponse(res, error, error.statusCode || 500);
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const { users, totalPages } = await UserService.getUsers(page, limit);

    successResponse(
      res,
      { users, totalPages },
      "Users fetched successfully!",
      200
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    errorResponse(res, "Internal Server Error", 500);
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const { userId, isBlocked } = req.body;
    const updatedUser = await UserService.blockUser(userId, isBlocked);
    res.status(200).json({
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating block status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStudentCourses = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      errorResponse(res, "Unauthorized", 401);
      return;
    }
    const userId = req.user.id;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { courses, totalPages } = await fetchEnrolledCourses(
      userId,
      page,
      limit
    );
    if (!courses) {
      errorResponse(res, "No courses found for this student", 404);
      return;
    }
    successResponse(
      res,
      { courses, totalPages },
      "Student courses fetched successfully!",
      200
    );
  } catch (error: any) {
    console.error("Error fetching student courses:", error);
    errorResponse(res, "Internal Server Error", error.status || 500);
  }
};

export const getUserStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      errorResponse(res, "User not found", 404);
      return;
    }
    res.json({ isBlocked: user?.isBlocked });
  } catch (error: any) {
    console.error("Error fetching user status:", error);
    errorResponse(res, "Internal Server Error", error.status || 500);
  }
};
