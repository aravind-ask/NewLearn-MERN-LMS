"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.BadRequestError = void 0;
const statusCodes_1 = require("./statusCodes");
class CustomError extends Error {
    constructor(message, statusCode, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
class BadRequestError extends CustomError {
    constructor(message = "Bad Request", details) {
        super(message, statusCodes_1.HttpStatus.BAD_REQUEST, details);
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends CustomError {
    constructor(message = "Not Found", details) {
        super(message, statusCodes_1.HttpStatus.NOT_FOUND, details);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends CustomError {
    constructor(message = "Unauthorized", details) {
        super(message, statusCodes_1.HttpStatus.UNAUTHORIZED, details);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends CustomError {
    constructor(message = "Forbidden", details) {
        super(message, statusCodes_1.HttpStatus.FORBIDDEN, details);
    }
}
exports.ForbiddenError = ForbiddenError;
class InternalServerError extends CustomError {
    constructor(message = "Internal Server Error", details) {
        super(message, statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR, details);
    }
}
exports.InternalServerError = InternalServerError;
