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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferRepository = void 0;
const Offers_1 = require("../models/Offers");
const mongoose_1 = __importDefault(require("mongoose"));
class OfferRepository {
    findAll(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (page < 1 || limit < 1) {
                throw new Error("Invalid pagination parameters");
            }
            return Offers_1.Offer.find()
                .skip((page - 1) * limit)
                .limit(limit)
                .populate("category")
                .sort({ createdAt: -1 });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid offer ID");
            }
            return Offers_1.Offer.findById(id).populate("category");
        });
    }
    create(offerData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const offer = new Offers_1.Offer(offerData);
                return yield offer.save();
            }
            catch (error) {
                throw new Error(`Failed to create offer: ${error.message}`);
            }
        });
    }
    update(id, offerData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid offer ID");
            }
            const offer = yield Offers_1.Offer.findByIdAndUpdate(id, offerData, {
                new: true,
                runValidators: true,
            }).populate("category");
            if (!offer) {
                throw new Error("Offer not found");
            }
            return offer;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                throw new Error("Invalid offer ID");
            }
            const result = yield Offers_1.Offer.findByIdAndDelete(id);
            if (!result) {
                throw new Error("Offer not found");
            }
        });
    }
}
exports.OfferRepository = OfferRepository;
