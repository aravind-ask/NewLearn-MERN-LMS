import { Request, Response } from "express";
import UserService from "../services/user.service";
import { getPresignedUrl } from "../config/s3.config";
import { errorResponse, successResponse } from "../utils/responseHandler";
import dotenv from "dotenv";

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
      key: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/profile-pics/${fileName}`,
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
    const { name, email, password, profilePic } = req.body;

    if (!req.user) {
      // return res.status(401).json({ message: "Unauthorized" });
      errorResponse(res, "Unauthorized", 401);
      return;
    }
    console.log("req.user", req.user);

    const updatedUser = await UserService.updateProfile(
      req.user.id,
      name,
      email,
      password,
      profilePic
    );

    if (!updatedUser) {
      // return res.status(404).json({ message: "User not found" }); // ✅ Return to prevent further execution
      errorResponse(res, "User not found", 404);
      return;
    }

    // return res.json({
    //   message: "Profile updated successfully!",
    //   user: updatedUser,
    // });
    successResponse(res, updatedUser, "Profile updated successfully!", 200);
  } catch (error) {
    console.error("Update Profile Error:", error);
    // return res.status(500).json({ message: "Profile update failed" }); // ✅ Return to prevent further execution
    errorResponse(res, "Profile update failed", 500);
  }
};
