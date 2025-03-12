import { HttpStatus } from "./statusCodes";

class CustomError extends Error {
  public statusCode: number;
  public details?: string;

  constructor(message: string, statusCode: number, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends CustomError {
  constructor(message = "Bad Request", details?: string) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = "Not Found", details?: string) {
    super(message, HttpStatus.NOT_FOUND, details);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized", details?: string) {
    super(message, HttpStatus.UNAUTHORIZED, details);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = "Forbidden", details?: string) {
    super(message, HttpStatus.FORBIDDEN, details);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = "Internal Server Error", details?: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}
