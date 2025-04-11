// src/controllers/OfferController.ts
import { Request, Response } from "express";
import { OfferService } from "../services/offer.service";

export class OfferController {
  constructor(private offerService: OfferService) {}

  async getOffers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { items, totalItems, totalPages } =
        await this.offerService.getOffers(page, limit);
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getOfferById(req: Request, res: Response): Promise<void> {
    try {
      const offer = await this.offerService.getOfferById(req.params.id);
      res.json({
        success: true,
        data: offer,
      });
    } catch (error: any) {
      res.status(error.message === "Offer not found" ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createOffer(req: Request, res: Response): Promise<void> {
    try {
      const offer = await this.offerService.createOffer(req.body);
      res.status(201).json({
        success: true,
        data: offer,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateOffer(req: Request, res: Response): Promise<void> {
    try {
      const offer = await this.offerService.updateOffer(
        req.params.id,
        req.body
      );
      res.json({
        success: true,
        data: offer,
      });
    } catch (error: any) {
      res.status(error.message === "Offer not found" ? 404 : 400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteOffer(req: Request, res: Response): Promise<void> {
    try {
      await this.offerService.deleteOffer(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.message === "Offer not found" ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
