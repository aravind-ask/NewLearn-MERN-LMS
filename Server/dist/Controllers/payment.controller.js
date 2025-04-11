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
exports.PaymentController = void 0;
const responseHandler_1 = require("../utils/responseHandler");
const statusCodes_1 = require("../utils/statusCodes");
class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    createOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, courses, userId, userName, userEmail } = req.body;
                const order = yield this.paymentService.createRazorpayOrder({
                    amount,
                    courses,
                    userId,
                    userName,
                    userEmail,
                });
                (0, responseHandler_1.successResponse)(res, order, "Order created successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message || "Failed to create order", error.statusCode || statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    verifyPayment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { success } = yield this.paymentService.verifyRazorpayPayment(req.body);
                (0, responseHandler_1.successResponse)(res, { success }, "Payment verified successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message || "Payment verification failed", error.statusCode || statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllPayments(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payments = yield this.paymentService.getAllPayments();
                (0, responseHandler_1.successResponse)(res, payments, "Payments fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message || "Error fetching payments", error.statusCode || statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getPaymentsByDateRange(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { startDate, endDate } = req.query;
                const payments = yield this.paymentService.getPaymentsByDate(new Date(startDate), new Date(endDate));
                (0, responseHandler_1.successResponse)(res, payments, "Payments fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                (0, responseHandler_1.errorResponse)(res, error.message || "Error fetching payments by date range", error.statusCode || statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getUserPaymentHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { payments, totalPages } = yield this.paymentService.getUserPaymentHistory(userId, page, limit);
                (0, responseHandler_1.successResponse)(res, { payments, totalPages }, "User payment history fetched successfully", statusCodes_1.HttpStatus.OK);
            }
            catch (error) {
                console.log(error);
                (0, responseHandler_1.errorResponse)(res, error.message || "Error fetching user payment history", error.statusCode || statusCodes_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
exports.PaymentController = PaymentController;
