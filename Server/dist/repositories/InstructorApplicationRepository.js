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
class InstructorApplicationRepository {
    createApplication(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield InstructorApplication_1.InstructorApplication.create(data);
            }
            catch (error) {
                throw new Error("Error creating instructor application");
            }
        });
    }
    updateApplication(applicationId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const application = yield InstructorApplication_1.InstructorApplication.findByIdAndUpdate(applicationId, Object.assign(Object.assign({}, data), { updatedAt: new Date() }), { new: true, runValidators: true }).exec();
            if (!application) {
                throw new Error("Application not found");
            }
            return application;
        });
    }
    getApplications(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const skip = (page - 1) * limit;
                const applications = yield InstructorApplication_1.InstructorApplication.find()
                    .skip(skip)
                    .limit(limit)
                    .exec();
                const totalApplications = yield InstructorApplication_1.InstructorApplication.countDocuments();
                const totalPages = Math.ceil(totalApplications / limit);
                return { applications, totalPages, totalApplications };
            }
            catch (error) {
                throw new Error("Error fetching instructor applications");
            }
        });
    }
    getApplicationById(applicationId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield InstructorApplication_1.InstructorApplication.findById(applicationId).exec();
            }
            catch (error) {
                throw new Error("Error fetching application by ID");
            }
        });
    }
    getApplication(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield InstructorApplication_1.InstructorApplication.findOne({ user: userId }).exec();
            }
            catch (error) {
                throw new Error("Error fetching application by user ID");
            }
        });
    }
    updateApplicationStatus(applicationId, status, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield InstructorApplication_1.InstructorApplication.findByIdAndUpdate(applicationId, { status, rejectionReason }, { new: true }).exec();
            }
            catch (error) {
                throw new Error("Error updating application status");
            }
        });
    }
}
exports.InstructorApplicationRepository = InstructorApplicationRepository;
