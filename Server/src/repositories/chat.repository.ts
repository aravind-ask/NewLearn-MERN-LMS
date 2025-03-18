import { ChatMessage, IChatMessage } from "../models/ChatMessage";
import { IChatRepository } from "./interfaces/IChatRepository";
import { NotFoundError } from "../utils/customError";
import mongoose from "mongoose";

export class ChatRepository implements IChatRepository {
  async saveMessage(message: Partial<IChatMessage>): Promise<IChatMessage> {
    const newMessage = new ChatMessage(message);
    return await newMessage.save();
  }

  async getMessages(
    courseId: string,
    userId: string | undefined,
    trainerId: string
  ): Promise<IChatMessage[]> {
    return await ChatMessage.find({
      courseId: new mongoose.Types.ObjectId(courseId),
      $or: [
        {
          senderId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          recipientId: new mongoose.Types.ObjectId(trainerId),
        },
        {
          senderId: new mongoose.Types.ObjectId(trainerId),
          recipientId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        },
      ],
    }).sort({ timestamp: 1 });
  }

  async markAsRead(messageId: string): Promise<IChatMessage> {
    const message = await ChatMessage.findByIdAndUpdate(
      new mongoose.Types.ObjectId(messageId),
      { isRead: true },
      { new: true }
    );
    if (!message) throw new NotFoundError("Message not found");
    return message;
  }

  async getAllMessagesForTrainer(trainerId: string): Promise<IChatMessage[]> {
    return await ChatMessage.find({
      $or: [{ senderId: trainerId }, { recipientId: trainerId }],
    })
      .populate("courseId", "title")
      .populate("senderId", "name")
      .populate("recipientId", "name")
      .sort({ timestamp: 1 });
  }
}
