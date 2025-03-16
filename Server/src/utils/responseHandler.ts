import { Response } from "express";
import { HttpStatus } from "./statusCodes";

export const successResponse = (
  res: Response,
  data: any,
  message = "Success",
  status = HttpStatus.OK
) => {
  console.log("Response Data",data)
  return res.status(status).json({ success: true, message, data });
};

export const errorResponse = (res: Response, error: any, status = HttpStatus.INTERNAL_SERVER_ERROR) => {
  console.error(error);
  return res.status(status).json({
    success: false,
    message: error || "Internal Server Error",
  });
};
