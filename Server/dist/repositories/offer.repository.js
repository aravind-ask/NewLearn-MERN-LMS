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
// src/repositories/OfferRepository.ts
const Offers_1 = require("../models/Offers");
const base_repository_1 = require("./base.repository");
const mongoose_1 = __importDefault(require("mongoose"));
class OfferRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Offers_1.Offer);
    }
    findAll(page_1, limit_1) {
        const _super = Object.create(null, {
            findAll: { get: () => super.findAll }
        });
        return __awaiter(this, arguments, void 0, function* (page, limit, query = {}, sortOptions = { createdAt: -1 }) {
            try {
                if (page < 1 || limit < 1) {
                    throw new Error("Invalid pagination parameters");
                }
                const result = yield _super.findAll.call(this, page, limit, query, sortOptions);
                const populatedItems = yield this.model.populate(result.items, {
                    path: "category",
                });
                return {
                    items: populatedItems,
                    totalItems: result.totalItems,
                    totalPages: result.totalPages,
                };
            }
            catch (error) {
                console.error("Error fetching all offers:", error);
                throw new Error(error instanceof Error ? error.message : "Failed to fetch all offers");
            }
        });
    }
    findById(id) {
        const _super = Object.create(null, {
            findById: { get: () => super.findById }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new Error("Invalid offer ID");
                }
                return yield _super.findById.call(this, id, "category");
            }
            catch (error) {
                console.error("Error finding offer by ID:", error);
                throw new Error(error instanceof Error ? error.message : "Failed to find offer by ID");
            }
        });
    }
    create(offerData) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield _super.create.call(this, offerData);
            }
            catch (error) {
                console.error("Error creating offer:", error);
                throw new Error(error instanceof Error
                    ? `Failed to create offer: ${error.message}`
                    : "Failed to create offer");
            }
        });
    }
    update(id, offerData) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new Error("Invalid offer ID");
                }
                const updatedOffer = yield _super.update.call(this, id, offerData);
                if (!updatedOffer) {
                    throw new Error("Offer not found");
                }
                return yield this.model.populate(updatedOffer, { path: "category" });
            }
            catch (error) {
                console.error("Error updating offer:", error);
                throw new Error(error instanceof Error ? error.message : "Failed to update offer");
            }
        });
    }
    delete(id) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    throw new Error("Invalid offer ID");
                }
                const result = yield _super.delete.call(this, id);
                if (!result) {
                    throw new Error("Offer not found");
                }
                return result;
            }
            catch (error) {
                console.error("Error deleting offer:", error);
                throw new Error(error instanceof Error ? error.message : "Failed to delete offer");
            }
        });
    }
}
exports.OfferRepository = OfferRepository;
