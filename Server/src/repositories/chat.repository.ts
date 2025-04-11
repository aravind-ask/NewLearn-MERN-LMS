// src/repositories/ChatRepository.ts
import { ChatMessage, IChatMessage } from "../models/ChatMessage";
import { IChatRepository } from "./interfaces/IChatRepository";
import { NotFoundError } from "../utils/customError";
import { BaseRepository } from "./base.repository";
import mongoose from "mongoose";

export class ChatRepository
  extends BaseRepository<IChatMessage>
  implements IChatRepository
{
  constructor() {
    super(ChatMessage);
  }

  async saveMessage(message: Partial<IChatMessage>): Promise<IChatMessage> {
    return await this.create(message);
  }

  async getMessageById(messageId: string): Promise<IChatMessage | null> {
    return await this.findById(messageId);
  }

  async updateMessage(
    messageId: string,
    updates: {
      message?: string;
      mediaUrl?: string;
      isDeleted: boolean;
      isEdited?: boolean;
    }
  ): Promise<IChatMessage> {
    const message = await this.update(messageId, updates);
    if (!message) throw new NotFoundError("Message not found");
    return message;
  }

  async deleteMessage(messageId: string): Promise<IChatMessage> {
    const message = await this.delete(messageId);
    if (!message) throw new NotFoundError("Message not found");
    return message;
  }

  async getMessages(
    courseId: string,
    userId: string | undefined,
    trainerId: string
  ): Promise<IChatMessage[]> {
    try {
      const query = {
        courseId: new mongoose.Types.ObjectId(courseId),
        $or: [
          {
            senderId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
            recipientId: new mongoose.Types.ObjectId(trainerId),
          },
          {
            senderId: new mongoose.Types.ObjectId(trainerId),
            recipientId: userId
              ? new mongoose.Types.ObjectId(userId)
              : undefined,
          },
        ],
      };
      return await this.model.find(query).sort({ timestamp: 1 }).exec();
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw new Error("Failed to fetch messages");
    }
  }

  async markAsRead(messageId: string): Promise<IChatMessage> {
    const message = await this.update(messageId, { isRead: true });
    if (!message) throw new NotFoundError("Message not found");
    return message;
  }

  async getAllMessagesForTrainer(trainerId: string): Promise<IChatMessage[]> {
    try {
      return await this.model
        .find({
          $or: [
            { senderId: new mongoose.Types.ObjectId(trainerId) },
            { recipientId: new mongoose.Types.ObjectId(trainerId) },
          ],
        })
        .populate("courseId", "title")
        .populate("senderId", "name")
        .populate("recipientId", "name")
        .sort({ timestamp: 1 })
        .exec();
    } catch (error) {
      console.error("Error fetching all messages for trainer:", error);
      throw new Error("Failed to fetch all messages for trainer");
    }
  }
}
