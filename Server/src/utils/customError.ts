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
    super(message, 400, details);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = "Not Found", details?: string) {
    super(message, 404, details);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized", details?: string) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = "Forbidden", details?: string) {
    super(message, 403, details);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = "Internal Server Error", details?: string) {
    super(message, 500, details);
  }
}
