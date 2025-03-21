import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { BadRequestError } from "../utils/customError";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export class ChatController {
  constructor(private chatService: ChatService) {}

  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseId, recipientId, message } = req.body;
      const senderId = req.user?.id;

      if (!courseId || !recipientId || !message) {
        throw new BadRequestError("Missing required fields");
      }

      const newMessage = await this.chatService.sendMessage({
        courseId,
        senderId,
        recipientId,
        message,
      });

      successResponse(res, newMessage, "Message sent successfully");
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async getConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseId, trainerId } = req.params;
      const userId = req.user?.id;

      if (!courseId || !trainerId) {
        throw new BadRequestError("Missing required parameters");
      }

      const messages = await this.chatService.getConversation(
        courseId,
        userId,
        trainerId
      );
      successResponse(res, messages, "Conversation retrieved successfully");
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async getAllInstructorConversations(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) throw new BadRequestError("Trainer ID required");

      const messages = await this.chatService.getAllConversationsForTrainer(
        trainerId
      );
      successResponse(
        res,
        messages,
        "All conversations retrieved successfully"
      );
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async markMessageAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { messageId } = req.params;
      if (!messageId) throw new BadRequestError("Message ID required");

      const updatedMessage = await this.chatService.markMessageAsRead(
        messageId
      );
      successResponse(res, updatedMessage, "Message marked as read");

      // Notify via Socket.IO
      const io = req.app.get("io"); // Assuming io is attached to app in server setup
      const room = `chat_${updatedMessage.courseId}_${updatedMessage.senderId}`;
      io.to(room).emit("messageRead", updatedMessage);
      console.log(`Emitted messageRead to room ${room}:`, updatedMessage);
    } catch (error) {
      errorResponse(res, error);
    }
  }
}
