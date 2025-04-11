// src/repositories/OfferRepository.ts
import { Offer, IOffer } from "../models/Offers";
import { IOfferRepository } from "./interfaces/IOfferRepository";
import { BaseRepository } from "./base.repository"; 
import mongoose from "mongoose";

export class OfferRepository
  extends BaseRepository<IOffer>
  implements IOfferRepository
{
  constructor() {
    super(Offer);
  }

  async findAll(
    page: number,
    limit: number,
    query: any = {},
    sortOptions: { [key: string]: 1 | -1 } = { createdAt: -1 }
  ): Promise<{ items: IOffer[]; totalItems: number; totalPages: number }> {
    try {
      if (page < 1 || limit < 1) {
        throw new Error("Invalid pagination parameters");
      }
      const result = await super.findAll(page, limit, query, sortOptions);
      const populatedItems = await this.model.populate(result.items, {
        path: "category",
      });
      return {
        items: populatedItems as IOffer[],
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      };
    } catch (error) {
      console.error("Error fetching all offers:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch all offers"
      );
    }
  }

  async findById(id: string): Promise<IOffer | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid offer ID");
      }
      return await super.findById(id, "category");
    } catch (error) {
      console.error("Error finding offer by ID:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to find offer by ID"
      );
    }
  }

  async create(offerData: Partial<IOffer>): Promise<IOffer> {
    try {
      return await super.create(offerData);
    } catch (error) {
      console.error("Error creating offer:", error);
      throw new Error(
        error instanceof Error
          ? `Failed to create offer: ${error.message}`
          : "Failed to create offer"
      );
    }
  }

  async update(id: string, offerData: Partial<IOffer>): Promise<IOffer | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid offer ID");
      }
      const updatedOffer = await super.update(id, offerData);
      if (!updatedOffer) {
        throw new Error("Offer not found");
      }
      return await this.model.populate(updatedOffer, { path: "category" });
    } catch (error) {
      console.error("Error updating offer:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update offer"
      );
    }
  }

  async delete(id: string): Promise<IOffer | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid offer ID");
      }
      const result = await super.delete(id);
      if (!result) {
        throw new Error("Offer not found");
      }
      return result;
    } catch (error) {
      console.error("Error deleting offer:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to delete offer"
      );
    }
  }
}
