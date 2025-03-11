import { IOffer } from "../../models/Offers";

export interface IOfferService {
  getOffers(page: number, limit: number): Promise<IOffer[]>;
  getOfferById(id: string): Promise<IOffer>;
  createOffer(offerData: Partial<IOffer>): Promise<IOffer>;
  updateOffer(id: string, offerData: Partial<IOffer>): Promise<IOffer>;
  deleteOffer(id: string): Promise<void>;
}
