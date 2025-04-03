"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const statusCodes_1 = require("./statusCodes");
const successResponse = (res, data, message = "Success", status = statusCodes_1.HttpStatus.OK) => {
    return res.status(status).json({ success: true, message, data });
};
exports.successResponse = successResponse;
const errorResponse = (res, error, status = statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR) => {
    console.error(error);
    return res.status(status).json({
        success: false,
        message: error || "Internal Server Error",
    });
};
exports.errorResponse = errorResponse;
