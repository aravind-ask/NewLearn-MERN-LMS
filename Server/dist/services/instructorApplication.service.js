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
exports.InstructorApplicationService = void 0;
const customError_1 = require("../utils/customError");
class InstructorApplicationService {
    constructor(instructorAppRepo, userRepo) {
        this.instructorAppRepo = instructorAppRepo;
        this.userRepo = userRepo;
    }
    applyForInstructor(userId, applicationData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId)
                throw new customError_1.BadRequestError("User ID is required");
            const existingApplication = yield this.instructorAppRepo.getApplication(userId);
            if (existingApplication) {
                throw new customError_1.BadRequestError("You have already applied for instructor verification");
            }
            return yield this.instructorAppRepo.createApplication(Object.assign({ user: userId }, applicationData));
        });
    }
    updateApplication(applicationId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield this.instructorAppRepo.getApplicationById(applicationId);
            if (!application)
                throw new customError_1.NotFoundError("Application not found");
            const updatedApplication = yield this.instructorAppRepo.updateApplication(applicationId, Object.assign(Object.assign({}, data), { status: "pending", rejectionReason: null }));
            if (!updatedApplication)
                throw new Error("Failed to update application");
            return updatedApplication;
        });
    }
    getInstructorApplications(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const { applications, totalPages } = yield this.instructorAppRepo.getApplications(page, limit);
            return { applications, totalPages };
        });
    }
    getApplication(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId)
                throw new customError_1.BadRequestError("User ID is required");
            const application = yield this.instructorAppRepo.getApplication(userId);
            if (!application)
                throw new customError_1.NotFoundError("Application not found");
            return application;
        });
    }
    getApplicationDetails(applicationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield this.instructorAppRepo.getApplicationById(applicationId);
            if (!application)
                throw new customError_1.NotFoundError("Application not found");
            return application;
        });
    }
    reviewApplication(applicationId, status, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield this.instructorAppRepo.getApplicationById(applicationId);
            if (!application)
                throw new customError_1.NotFoundError("Application not found");
            const updatedApplication = yield this.instructorAppRepo.updateApplicationStatus(applicationId, status, rejectionReason);
            if (!updatedApplication)
                throw new Error("Failed to update application");
            if (status === "approved") {
                yield this.userRepo.updateUserRole(application.user.toString(), "instructor");
            }
            return updatedApplication;
        });
    }
}
exports.InstructorApplicationService = InstructorApplicationService;
