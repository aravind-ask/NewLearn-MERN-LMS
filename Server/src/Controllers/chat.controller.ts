import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utils/responseHandler";
import { BadRequestError } from "../utils/customError";
import { IChatService } from "../services/interfaces/IChatService";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export class ChatController {
  constructor(private chatService: IChatService) {}

  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { courseId, recipientId, message, mediaUrl } = req.body;
      const senderId = req.user?.id;

      if (!courseId || !recipientId) {
        throw new BadRequestError("Missing required fields");
      }

      const newMessage = await this.chatService.sendMessage({
        courseId,
        senderId,
        recipientId,
        message,
        mediaUrl,
      });

      successResponse(res, newMessage, "Message sent successfully");
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async editMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const { message, mediaUrl } = req.body;
      const senderId = req.user?.id;

      if (!messageId || (!message && !mediaUrl)) {
        throw new BadRequestError(
          "Message ID and at least one field (message or mediaUrl) are required"
        );
      }

      const updatedMessage = await this.chatService.editMessage(
        messageId,
        senderId,
        { message, mediaUrl }
      );
      const io = req.app.get("io");
      io.to(`chat_${updatedMessage.courseId}_${updatedMessage.senderId}`).emit(
        "messageEdited",
        updatedMessage
      );
      io.to(
        `chat_${updatedMessage.courseId}_${updatedMessage.recipientId}`
      ).emit("messageEdited", updatedMessage);
      successResponse(res, updatedMessage, "Message updated successfully");
    } catch (error) {
      errorResponse(res, error);
    }
  }

  async deleteMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const senderId = req.user?.id;

      if (!messageId) {
        throw new BadRequestError("Message ID is required");
      }

      const deletedMessage = await this.chatService.deleteMessage(
        messageId,
        senderId
      );
      const io = req.app.get("io");
      io.to(`chat_${deletedMessage.courseId}_${deletedMessage.senderId}`).emit(
        "messageDeleted",
        deletedMessage
      );
      io.to(
        `chat_${deletedMessage.courseId}_${deletedMessage.recipientId}`
      ).emit("messageDeleted", deletedMessage);
      successResponse(res, deletedMessage, "Message marked as deleted");
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

      const io = req.app.get("io");
      const studentRoom = `chat_${updatedMessage.courseId}_${updatedMessage.senderId}`;
      const instructorRoom = `instructor_${updatedMessage.recipientId}`;

      io.to(studentRoom).emit("messageRead", updatedMessage);
      console.log(
        `Emitted messageRead to room ${studentRoom}:`,
        updatedMessage
      );

      if (updatedMessage.senderId !== updatedMessage.recipientId) {
        io.to(instructorRoom).emit("messageRead", updatedMessage);
        console.log(
          `Emitted messageRead to room ${instructorRoom}:`,
          updatedMessage
        );
      }
    } catch (error) {
      errorResponse(res, error);
    }
  }
}
