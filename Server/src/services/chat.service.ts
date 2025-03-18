import { IChatService } from "./interfaces/IChatService";
import { IChatRepository } from "../repositories/interfaces/IChatRepository";
import { IChatMessage } from "../models/ChatMessage";
import mongoose from "mongoose";

export class ChatService implements IChatService {
  constructor(private chatRepository: IChatRepository) {}

  async sendMessage(messageData: {
    courseId: string;
    senderId: string | undefined;
    recipientId: string;
    message: string;
  }): Promise<IChatMessage> {
    const messageDataWithObjectId = {
      courseId: new mongoose.Types.ObjectId(messageData.courseId),
      senderId: messageData.senderId
        ? new mongoose.Types.ObjectId(messageData.senderId)
        : undefined,
      recipientId: new mongoose.Types.ObjectId(messageData.recipientId),
      message: messageData.message,
    };

    return await this.chatRepository.saveMessage(messageDataWithObjectId);
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
