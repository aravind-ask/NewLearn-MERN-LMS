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
exports.OfferController = void 0;
class OfferController {
    constructor(offerService) {
        this.offerService = offerService;
    }
    getOffers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const { items, totalItems, totalPages } = yield this.offerService.getOffers(page, limit);
                res.json({
                    success: true,
                    data: items,
                    pagination: {
                        page,
                        limit,
                        total: totalItems,
                        totalPages,
                    },
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    getOfferById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const offer = yield this.offerService.getOfferById(req.params.id);
                res.json({
                    success: true,
                    data: offer,
                });
            }
            catch (error) {
                res.status(error.message === "Offer not found" ? 404 : 500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    createOffer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const offer = yield this.offerService.createOffer(req.body);
                res.status(201).json({
                    success: true,
                    data: offer,
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    updateOffer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const offer = yield this.offerService.updateOffer(req.params.id, req.body);
                res.json({
                    success: true,
                    data: offer,
                });
            }
            catch (error) {
                res.status(error.message === "Offer not found" ? 404 : 400).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    deleteOffer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.offerService.deleteOffer(req.params.id);
                res.status(204).send();
            }
            catch (error) {
                res.status(error.message === "Offer not found" ? 404 : 500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
}
exports.OfferController = OfferController;
