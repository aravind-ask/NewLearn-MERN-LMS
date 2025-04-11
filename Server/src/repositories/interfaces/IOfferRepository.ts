// src/repositories/interfaces/IOfferRepository.ts
import { IOffer } from "../../models/Offers";

export interface IOfferRepository {
  findAll(
    page: number,
    limit: number,
    query?: any,
    sortOptions?: { [key: string]: 1 | -1 }
  ): Promise<{ items: IOffer[]; totalItems: number; totalPages: number }>;
  findById(id: string): Promise<IOffer | null>;
  create(offerData: Partial<IOffer>): Promise<IOffer>;
  update(id: string, offerData: Partial<IOffer>): Promise<IOffer | null>;
  delete(id: string): Promise<IOffer | null>;
}
