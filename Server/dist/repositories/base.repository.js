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
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const document = new this.model(data);
                return yield document.save();
            }
            catch (error) {
                console.error(`Error creating document in ${this.model.modelName}:`, error);
                throw new Error(`Failed to create ${this.model.modelName}`);
            }
        });
    }
    findById(id, populateFields) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = this.model.findById(id);
                if (populateFields) {
                    query.populate(populateFields);
                }
                return yield query.exec();
            }
            catch (error) {
                console.error(`Error finding ${this.model.modelName} by ID:`, error);
                throw new Error(`Failed to find ${this.model.modelName} by ID`);
            }
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model.findByIdAndUpdate(id, data, { new: true }).exec();
            }
            catch (error) {
                console.error(`Error updating ${this.model.modelName}:`, error);
                throw new Error(`Failed to update ${this.model.modelName}`);
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.model.findByIdAndDelete(id).exec();
            }
            catch (error) {
                console.error(`Error deleting ${this.model.modelName}:`, error);
                throw new Error(`Failed to delete ${this.model.modelName}`);
            }
        });
    }
    findAll(page_1, limit_1) {
        return __awaiter(this, arguments, void 0, function* (page, limit, query = {}, sortOptions = { createdAt: -1 }) {
            try {
                const skip = (page - 1) * limit;
                const items = yield this.model
                    .find(query)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .exec();
                const totalItems = yield this.model.countDocuments(query);
                const totalPages = Math.ceil(totalItems / limit);
                return { items, totalItems, totalPages };
            }
            catch (error) {
                console.error(`Error fetching all ${this.model.modelName}s:`, error);
                throw new Error(`Failed to fetch all ${this.model.modelName}s`);
            }
        });
    }
    findOne(query, populateFields) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const q = this.model.findOne(query);
                if (populateFields) {
                    q.populate(populateFields);
                }
                return yield q.exec();
            }
            catch (error) {
                console.error(`Error finding one ${this.model.modelName}:`, error);
                throw new Error(`Failed to find one ${this.model.modelName}`);
            }
        });
    }
}
exports.BaseRepository = BaseRepository;
