import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "../types/customRequest";
import { errorResponse } from "../utils/responseHandler";

export const authorizeRoles = (roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    console.log("user:",user?.role);

    if (!user || !roles.includes(user.role)) {
      errorResponse(res, "Forbidden", 403);
      return;
    }
    next();
  };
};
