"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, message = "Success", status = 200) => {
    return res.status(status).json({ success: true, message, data });
};
exports.successResponse = successResponse;
const errorResponse = (res, error, status = 500) => {
    console.error(error);
    return res.status(status).json({
        success: false,
        message: error.message || "Internal Server Error",
    });
};
exports.errorResponse = errorResponse;
