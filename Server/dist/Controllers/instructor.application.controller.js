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
exports.InstructorApplicationController = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const statusCodes_1 = require("../utils/statusCodes");
const mongoose_1 = require("mongoose");
class InstructorApplicationController {
    constructor(instructorAppService) {
        this.instructorAppService = instructorAppService;
    }
    applyForInstructor(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const application = yield this.instructorAppService.applyForInstructor(userId, req.body);
                (0, responseHandler_1.successResponse)(res, application, "Application submitted successfully", statusCodes_1.HttpStatus.CREATED);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    updateApplication(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { applicationId } = req.params;
                const application = yield this.instructorAppService.updateApplication(applicationId, req.body);
                (0, responseHandler_1.successResponse)(res, application, "Application updated successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    getApplications(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = "1", limit = "10" } = req.query;
                const { applications, totalPages } = yield this.instructorAppService.getInstructorApplications(Number(page), Number(limit));
                (0, responseHandler_1.successResponse)(res, { applications, totalPages }, "Instructor applications fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    reviewApplication(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { applicationId } = req.params;
                const { status, rejectionReason } = req.body;
                if (!mongoose_1.Types.ObjectId.isValid(applicationId)) {
                    (0, responseHandler_1.errorResponse)(res, "Invalid application ID", statusCodes_1.HttpStatus.BAD_REQUEST);
                    return;
                }
                const updatedApplication = yield this.instructorAppService.reviewApplication(applicationId, status, rejectionReason);
                (0, responseHandler_1.successResponse)(res, updatedApplication, "Application reviewed successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    getApplication(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const application = yield this.instructorAppService.getApplication(userId);
                (0, responseHandler_1.successResponse)(res, application, "Instructor application fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    getInstructorDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instructorId } = req.params;
                if (!mongoose_1.Types.ObjectId.isValid(instructorId)) {
                    (0, responseHandler_1.errorResponse)(res, "Invalid instructor ID", statusCodes_1.HttpStatus.BAD_REQUEST);
                    return;
                }
                const application = yield this.instructorAppService.getInstructorDetails(instructorId);
                (0, responseHandler_1.successResponse)(res, application, "Instructor details fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
    getApplicationDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { applicationId } = req.params;
                if (!mongoose_1.Types.ObjectId.isValid(applicationId)) {
                    (0, responseHandler_1.errorResponse)(res, "Invalid application ID", statusCodes_1.HttpStatus.BAD_REQUEST);
                    return;
                }
                const applicationDetails = yield this.instructorAppService.getApplicationDetails(applicationId);
                (0, responseHandler_1.successResponse)(res, applicationDetails, "Instructor application details fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message, error.statusCode || statusCodes_1.HttpStatus.BAD_REQUEST);
            }
        });
    }
}
exports.InstructorApplicationController = InstructorApplicationController;
exports.default = InstructorApplicationController;
