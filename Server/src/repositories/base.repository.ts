// src/repositories/BaseRepository.ts
import mongoose, { Model, Document } from "mongoose";

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      console.error(
        `Error creating document in ${this.model.modelName}:`,
        error
      );
      throw new Error(`Failed to create ${this.model.modelName}`);
    }
  }

  async findById(
    id: string,
    populateFields?: string | string[]
  ): Promise<T | null> {
    try {
      const query = this.model.findById(id);
      if (populateFields) {
        query.populate(populateFields);
      }
      return await query.exec();
    } catch (error) {
      console.error(`Error finding ${this.model.modelName} by ID:`, error);
      throw new Error(`Failed to find ${this.model.modelName} by ID`);
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    } catch (error) {
      console.error(`Error updating ${this.model.modelName}:`, error);
      throw new Error(`Failed to update ${this.model.modelName}`);
    }
  }

  async delete(id: string): Promise<T | null> {
    try {
      return await this.model.findByIdAndDelete(id).exec();
    } catch (error) {
      console.error(`Error deleting ${this.model.modelName}:`, error);
      throw new Error(`Failed to delete ${this.model.modelName}`);
    }
  }

  async findAll(
    page: number,
    limit: number,
    query: any = {},
    sortOptions: { [key: string]: 1 | -1 } = { createdAt: -1 }
  ): Promise<{ items: T[]; totalItems: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const items = await this.model
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec();

      const totalItems = await this.model.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limit);

      return { items, totalItems, totalPages };
    } catch (error) {
      console.error(`Error fetching all ${this.model.modelName}s:`, error);
      throw new Error(`Failed to fetch all ${this.model.modelName}s`);
    }
  }

  async findOne(
    query: any,
    populateFields?: string | string[]
  ): Promise<T | null> {
    try {
      const q = this.model.findOne(query);
      if (populateFields) {
        q.populate(populateFields);
      }
      return await q.exec();
    } catch (error) {
      console.error(`Error finding one ${this.model.modelName}:`, error);
      throw new Error(`Failed to find one ${this.model.modelName}`);
    }
  }
}
