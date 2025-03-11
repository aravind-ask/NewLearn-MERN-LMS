import { Offer, IOffer } from "../models/Offers";
import { IOfferRepository } from "../repositories/interfaces/IOfferRepository";
import mongoose from "mongoose";

export class OfferRepository implements IOfferRepository {
  async findAll(page: number, limit: number): Promise<IOffer[]> {
    if (page < 1 || limit < 1) {
      throw new Error("Invalid pagination parameters");
    }
    return Offer.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category")
      .sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IOffer | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid offer ID");
    }
    return Offer.findById(id).populate("category");
  }

  async create(offerData: Partial<IOffer>): Promise<IOffer> {
    try {
      const offer = new Offer(offerData);
      return await offer.save();
    } catch (error: any) {
      throw new Error(`Failed to create offer: ${error.message}`);
    }
  }

  async update(id: string, offerData: Partial<IOffer>): Promise<IOffer | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid offer ID");
    }
    const offer = await Offer.findByIdAndUpdate(id, offerData, {
      new: true,
      runValidators: true,
    }).populate("category");

    if (!offer) {
      throw new Error("Offer not found");
    }
    return offer;
  }

  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid offer ID");
    }
    const result = await Offer.findByIdAndDelete(id);
    if (!result) {
      throw new Error("Offer not found");
    }
  }
}
