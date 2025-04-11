// src/services/OfferService.ts
import { IOfferRepository } from "../repositories/interfaces/IOfferRepository";
import { IOffer } from "../models/Offers";
import { IOfferService } from "./interfaces/IOfferService";

export class OfferService implements IOfferService {
  constructor(private offerRepository: IOfferRepository) {}

  async getOffers(
    page: number,
    limit: number
  ): Promise<{ items: IOffer[]; totalItems: number; totalPages: number }> {
    try {
      return await this.offerRepository.findAll(page, limit);
    } catch (error: any) {
      throw new Error(`Failed to fetch offers: ${error.message}`);
    }
  }

  async getOfferById(id: string): Promise<IOffer> {
    const offer = await this.offerRepository.findById(id);
    if (!offer) {
      throw new Error("Offer not found");
    }
    return offer;
  }

  async createOffer(offerData: Partial<IOffer>): Promise<IOffer> {
    // Business logic validations
    if (
      !offerData.title ||
      !offerData.discountPercentage ||
      !offerData.startDate ||
      !offerData.endDate
    ) {
      throw new Error("Missing required fields");
    }

    if (
      offerData.discountPercentage < 0 ||
      offerData.discountPercentage > 100
    ) {
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
      return await this.offerRepository.create({
        ...offerData,
        isActive: true,
      });
    } catch (error: any) {
      throw new Error(`Failed to create offer: ${error.message}`);
    }
  }

  async updateOffer(id: string, offerData: Partial<IOffer>): Promise<IOffer> {
    // Validate update data if provided
    if (
      offerData.discountPercentage !== undefined &&
      (offerData.discountPercentage < 0 || offerData.discountPercentage > 100)
    ) {
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
      const offer = await this.offerRepository.update(id, offerData);
      if (!offer) {
        throw new Error("Offer not found");
      }
      return offer;
    } catch (error: any) {
      throw new Error(`Failed to update offer: ${error.message}`);
    }
  }

  async deleteOffer(id: string): Promise<void> {
    try {
      await this.offerRepository.delete(id);
    } catch (error: any) {
      throw new Error(`Failed to delete offer: ${error.message}`);
    }
  }
}
