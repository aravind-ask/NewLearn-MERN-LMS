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
exports.InstructorApplicationRepository = void 0;
// src/repositories/InstructorApplicationRepository.ts
const InstructorApplication_1 = require("../models/InstructorApplication");
const base_repository_1 = require("./base.repository");
const mongoose_1 = require("mongoose");
class InstructorApplicationRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(InstructorApplication_1.InstructorApplication);
    }
    createApplication(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.create(data);
            }
            catch (error) {
                console.error("Error creating instructor application:", error);
                throw new Error("Error creating instructor application");
            }
        });
    }
    updateApplication(applicationId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const application = yield this.update(applicationId, data);
                if (!application) {
                    throw new Error("Application not found");
                }
                return application;
            }
            catch (error) {
                console.error("Error updating instructor application:", error);
                throw new Error("Error updating instructor application");
            }
        });
    }
    getApplications(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const applications = yield this.model
                    .find()
                    .skip(skip)
                    .limit(limit)
                    .exec();
                const totalApplications = yield this.model.countDocuments();
                const totalPages = Math.ceil(totalApplications / limit);
                return { applications, totalPages, totalApplications };
            }
            catch (error) {
                console.error("Error fetching instructor applications:", error);
                throw new Error("Error fetching instructor applications");
            }
        });
    }
    getApplicationById(applicationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.findById(applicationId);
            }
            catch (error) {
                console.error("Error fetching application by ID:", error);
                throw new Error("Error fetching application by ID");
            }
        });
    }
    getApplication(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.findOne({ user: new mongoose_1.Types.ObjectId(userId) });
            }
            catch (error) {
                console.error("Error fetching application by user ID:", error);
                throw new Error("Error fetching application by user ID");
            }
        });
    }
    updateApplicationStatus(applicationId, status, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const application = yield this.update(applicationId, {
                    status,
                    rejectionReason,
                });
                if (!application) {
                    throw new Error("Application not found");
                }
                return application;
            }
            catch (error) {
                console.error("Error updating application status:", error);
                throw new Error("Error updating application status");
            }
        });
    }
}
exports.InstructorApplicationRepository = InstructorApplicationRepository;
