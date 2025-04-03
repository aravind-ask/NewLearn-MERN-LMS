"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const offer_controller_1 = require("../Controllers/offer.controller");
const offer_service_1 = require("../services/offer.service");
const offer_repository_1 = require("../repositories/offer.repository");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const authorizeRoles_1 = require("../middlewares/authorizeRoles");
// Dependency Injection
const offerRepository = new offer_repository_1.OfferRepository();
const offerService = new offer_service_1.OfferService(offerRepository);
const offerController = new offer_controller_1.OfferController(offerService);
const router = express_1.default.Router();
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
router.post("/", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), offerController.createOffer.bind(offerController));
router.put("/:id", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), offerController.updateOffer.bind(offerController));
router.delete("/:id", auth_middleware_1.authMiddleware.verifyAccessToken, (0, authorizeRoles_1.authorizeRoles)(["admin"]), offerController.deleteOffer.bind(offerController));
exports.default = router;
