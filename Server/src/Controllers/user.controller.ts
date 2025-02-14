import { Request, Response } from "express";
import UserService from "../services/user.service";
import { getPresignedUrl } from "../config/s3.config";
import { errorResponse, successResponse } from "../utils/responseHandler";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";


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
    const { name, email, password, photoUrl } = req.body;
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
      photoUrl
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
