import express from "express";
import { ChatController } from "../Controllers/chat.controller";
import { ChatService } from "../services/chat.service";
import { ChatRepository } from "../repositories/chat.repository";
import { authMiddleware } from "../middlewares/auth.middleware"; // Assuming you have this

const router = express.Router();
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

router.post(
  "/send",
  authMiddleware.verifyAccessToken,
  chatController.sendMessage.bind(chatController)
);
router.get(
  "/:courseId/:trainerId",
  authMiddleware.verifyAccessToken,
  chatController.getConversation.bind(chatController)
);
router.get(
  "/all",
  authMiddleware.verifyAccessToken,
  chatController.getAllInstructorConversations.bind(chatController)
);

export default router;
