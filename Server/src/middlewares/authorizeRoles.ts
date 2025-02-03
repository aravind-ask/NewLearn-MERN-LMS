import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "../types/customRequest";
import { errorResponse } from "../utils/responseHandler";

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as CustomRequest).user;
    console.log("usser:",user?.role);

    if (!user || !roles.includes(user.role)) {
      errorResponse(res, "Forbidden", 403);
      return;
    }
    next();
  };
};
