"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongoose_1 = __importStar(require("mongoose"));
class InstructorApplicationService {
    constructor(instructorAppRepo, userRepo) {
        this.instructorAppRepo = instructorAppRepo;
        this.userRepo = userRepo;
    }
    applyForInstructor(userId, applicationData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId)
                throw new customError_1.BadRequestError("User ID is required");
            if (!mongoose_1.Types.ObjectId.isValid(userId))
                throw new customError_1.BadRequestError("Invalid user ID");
            const existingApplication = yield this.instructorAppRepo.getApplication(userId);
            if (existingApplication) {
                throw new customError_1.BadRequestError("You have already applied for instructor verification");
            }
            return yield this.instructorAppRepo.createApplication(Object.assign({ user: new mongoose_1.default.Types.ObjectId(userId) }, applicationData));
        });
    }
    updateApplication(applicationId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(applicationId)) {
                throw new customError_1.BadRequestError("Invalid application ID");
            }
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
            if (page < 1 || limit < 1) {
                throw new customError_1.BadRequestError("Page and limit must be positive integers");
            }
            const { applications, totalPages } = yield this.instructorAppRepo.getApplications(page, limit);
            return { applications, totalPages };
        });
    }
    getApplication(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId)
                throw new customError_1.BadRequestError("User ID is required");
            if (!mongoose_1.Types.ObjectId.isValid(userId))
                throw new customError_1.BadRequestError("Invalid user ID");
            const application = yield this.instructorAppRepo.getApplication(userId);
            if (!application)
                throw new customError_1.NotFoundError("Application not found");
            return application;
        });
    }
    getApplicationDetails(applicationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(applicationId)) {
                throw new customError_1.BadRequestError("Invalid application ID");
            }
            const application = yield this.instructorAppRepo.getApplicationById(applicationId);
            if (!application)
                throw new customError_1.NotFoundError("Application not found");
            return application;
        });
    }
    getInstructorDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new customError_1.BadRequestError("Invalid user ID");
            }
            const application = yield this.instructorAppRepo.getApplication(userId);
            if (!application)
                throw new customError_1.NotFoundError("Instructor application not found");
            return application;
        });
    }
    reviewApplication(applicationId, status, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(applicationId)) {
                throw new customError_1.BadRequestError("Invalid application ID");
            }
            if (!["approved", "rejected"].includes(status)) {
                throw new customError_1.BadRequestError("Invalid status value");
            }
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
