import { IChatService } from "./interfaces/IChatService";
import { IChatRepository } from "../repositories/interfaces/IChatRepository";
import { IChatMessage } from "../models/ChatMessage";
import mongoose from "mongoose";
import { UnauthorizedError } from "../utils/customError";

export class ChatService implements IChatService {
  constructor(private chatRepository: IChatRepository) {}

  async sendMessage(messageData: {
    courseId: string;
    senderId: string | undefined;
    recipientId: string;
    message: string;
    mediaUrl?: string;
  }): Promise<IChatMessage> {
    const messageDataWithObjectId = {
      courseId: new mongoose.Types.ObjectId(messageData.courseId),
      senderId: messageData.senderId
        ? new mongoose.Types.ObjectId(messageData.senderId)
        : undefined,
      recipientId: new mongoose.Types.ObjectId(messageData.recipientId),
      message: messageData.message,
      mediaUrl: messageData.mediaUrl,
    };

    return await this.chatRepository.saveMessage(messageDataWithObjectId);
  }

  async editMessage(
    messageId: string,
    senderId: string | undefined,
    updates: { message?: string; mediaUrl?: string }
  ): Promise<IChatMessage> {
    const message = await this.chatRepository.getMessageById(messageId);
    if (!message || message.senderId.toString() !== senderId) {
      throw new UnauthorizedError("You can only edit your own messages");
    }
    return await this.chatRepository.updateMessage(messageId, {
      ...updates,
      isEdited: true,
    });
  }

  async deleteMessage(
    messageId: string,
    senderId: string | undefined
  ): Promise<IChatMessage> {
    const message = await this.chatRepository.getMessageById(messageId);
    if (!message || message.senderId.toString() !== senderId) {
      throw new UnauthorizedError("You can only delete your own messages");
    }
    return await this.chatRepository.updateMessage(messageId, {
      isDeleted: true,
    });
  }

  async getConversation(
    courseId: string,
    userId: string | undefined,
    trainerId: string
  ): Promise<IChatMessage[]> {
    return await this.chatRepository.getMessages(courseId, userId, trainerId);
  }

  async markMessageAsRead(messageId: string): Promise<IChatMessage> {
    return await this.chatRepository.markAsRead(messageId);
  }

  async getAllConversationsForTrainer(
    trainerId: string
  ): Promise<IChatMessage[]> {
    return await this.chatRepository.getAllMessagesForTrainer(trainerId);
  }
}
