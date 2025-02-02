import { Response } from "express";

export const successResponse = (
  res: Response,
  data: any,
  message = "Success",
  status = 200
) => {
  console.log("Data:", data);
  return res.status(status).json({ success: true, message, data });
};

export const errorResponse = (res: Response, error: any, status = 500) => {
  console.error(error);
  return res.status(status).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};
