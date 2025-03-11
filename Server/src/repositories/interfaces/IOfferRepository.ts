import { Offer, IOffer } from "../../models/Offers";

export interface IOfferRepository {
  findAll(page: number, limit: number): Promise<IOffer[]>;
  findById(id: string): Promise<IOffer | null>;
  create(offerData: Partial<IOffer>): Promise<IOffer>;
  update(id: string, offerData: Partial<IOffer>): Promise<IOffer | null>;
  delete(id: string): Promise<void>;
}
