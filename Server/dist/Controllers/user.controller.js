"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const s3_config_1 = require("../config/s3.config");
const responseHandler_1 = require("../utils/responseHandler");
const uuid_1 = require("uuid");
const statusCodes_1 = require("../utils/statusCodes");
class UserController {
    constructor(userService, enrollmentService) {
        this.userService = userService;
        this.enrollmentService = enrollmentService;
    }
    getUploadUrl(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fileName } = req.body;
                const url = yield (0, s3_config_1.getPresignedUrl)(fileName);
                res
                    .status(statusCodes_1.HttpStatus.OK)
                    .json({ url, key: `uploads/${(0, uuid_1.v4)()}-${Date.now()}-${fileName}` });
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, "Error generating upload URL", statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, photoUrl, bio, phoneNumber, address, dateOfBirth, education, } = req.body;
                if (!req.user) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const updatedUser = yield this.userService.updateProfile(req.user.id, name, email, password, photoUrl, bio, phoneNumber, address, dateOfBirth ? new Date(dateOfBirth) : undefined, education);
                const userResponse = {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    photoUrl: updatedUser.photoUrl,
                    bio: updatedUser.bio,
                    phoneNumber: updatedUser.phoneNumber,
                    address: updatedUser.address,
                    dateOfBirth: updatedUser.dateOfBirth,
                    education: updatedUser.education,
                    isBlocked: updatedUser.isBlocked,
                };
                (0, responseHandler_1.successResponse)(res, userResponse, "Profile updated successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const { users, totalPages } = yield this.userService.getUsers(page, limit);
                (0, responseHandler_1.successResponse)(res, { users, totalPages }, "Users fetched successfully", 200);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, "Error fetching users", statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    blockUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, isBlocked } = req.body;
                const updatedUser = yield this.userService.blockUser(userId, isBlocked);
                (0, responseHandler_1.successResponse)(res, updatedUser, `User ${isBlocked ? "blocked" : "unblocked"} successfully`, statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, "Error updating block status", statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getStudentCourses(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const userId = req.user.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { courses, totalPages } = yield this.enrollmentService.fetchEnrolledCourses(userId, page, limit);
                if (!courses.length) {
                    (0, responseHandler_1.errorResponse)(res, "No courses found for this student", statusCodes_1.HttpStatus.NOT_FOUND);
                    return;
                }
                (0, responseHandler_1.successResponse)(res, { courses, totalPages }, "Student courses fetched successfully", 200);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message || "Error fetching student courses", error.statusCode);
            }
        });
    }
    getUserStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    (0, responseHandler_1.errorResponse)(res, "Unauthorized", statusCodes_1.HttpStatus.UNAUTHORIZED);
                    return;
                }
                const user = yield this.userService.getUserStatus(req.user.id);
                (0, responseHandler_1.successResponse)(res, { isBlocked: user.isBlocked }, "User status fetched", statusCodes_1.HttpStatus.OK);
                // const data = {
                //   isBlocked: user.isBlocked,
                // };
                //  res.status(HttpStatus.OK).json(data);
                //  return
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, "Error fetching user status", error.statusCode);
            }
        });
    }
}
exports.UserController = UserController;
