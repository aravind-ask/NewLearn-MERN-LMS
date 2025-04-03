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
exports.OfferService = void 0;
class OfferService {
    constructor(offerRepository) {
        this.offerRepository = offerRepository;
    }
    getOffers(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.offerRepository.findAll(page, limit);
            }
            catch (error) {
                throw new Error(`Failed to fetch offers: ${error.message}`);
            }
        });
    }
    getOfferById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const offer = yield this.offerRepository.findById(id);
            if (!offer) {
                throw new Error("Offer not found");
            }
            return offer;
        });
    }
    createOffer(offerData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Business logic validations
            if (!offerData.title ||
                !offerData.discountPercentage ||
                !offerData.startDate ||
                !offerData.endDate) {
                throw new Error("Missing required fields");
            }
            if (offerData.discountPercentage < 0 ||
                offerData.discountPercentage > 100) {
                throw new Error("Discount percentage must be between 0 and 100");
            }
            const startDate = new Date(offerData.startDate);
            const endDate = new Date(offerData.endDate);
            const now = new Date();
            if (startDate > endDate) {
                throw new Error("Start date must be before end date");
            }
            if (endDate < now) {
                throw new Error("End date cannot be in the past");
            }
            try {
                return yield this.offerRepository.create(Object.assign(Object.assign({}, offerData), { isActive: true }));
            }
            catch (error) {
                throw new Error(`Failed to create offer: ${error.message}`);
            }
        });
    }
    updateOffer(id, offerData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate update data if provided
            if (offerData.discountPercentage !== undefined &&
                (offerData.discountPercentage < 0 || offerData.discountPercentage > 100)) {
                throw new Error("Discount percentage must be between 0 and 100");
            }
            if (offerData.startDate && offerData.endDate) {
                const startDate = new Date(offerData.startDate);
                const endDate = new Date(offerData.endDate);
                if (startDate > endDate) {
                    throw new Error("Start date must be before end date");
                }
            }
            try {
                const offer = yield this.offerRepository.update(id, offerData);
                if (!offer) {
                    throw new Error("Offer not found");
                }
                return offer;
            }
            catch (error) {
                throw new Error(`Failed to update offer: ${error.message}`);
            }
        });
    }
    deleteOffer(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.offerRepository.delete(id);
            }
            catch (error) {
                throw new Error(`Failed to delete offer: ${error.message}`);
            }
        });
    }
}
exports.OfferService = OfferService;
