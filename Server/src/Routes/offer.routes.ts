import express from "express";
import { OfferController } from "../Controllers/offer.controller";
import { OfferService } from "../services/offer.service";
import { OfferRepository } from "../repositories/offer.repository";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";

// Dependency Injection
const offerRepository = new OfferRepository();
const offerService = new OfferService(offerRepository);
const offerController = new OfferController(offerService);

const router = express.Router();

// // Middleware for basic request validation
// const validateId = (
//   req: Request,
//   res: Response,
//   next: express.NextFunction
// ) => {
//   if (!req.params.id || !/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid offer ID format",
//     });
//   }
//   next();
// };

router.get("/", offerController.getOffers.bind(offerController));
router.get("/:id", offerController.getOfferById.bind(offerController));
router.post(
  "/",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  offerController.createOffer.bind(offerController)
);
router.put(
  "/:id",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  offerController.updateOffer.bind(offerController)
);
router.delete(
  "/:id",
  authMiddleware.verifyAccessToken,
  authorizeRoles(["admin"]),
  offerController.deleteOffer.bind(offerController)
);

export default router;
