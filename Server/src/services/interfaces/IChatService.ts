import { ChatMessage, IChatMessage } from "../../models/ChatMessage";

export interface IChatService {
  sendMessage(messageData: {
    courseId: string;
    senderId: string | undefined;
    recipientId: string;
    message: string;
    mediaUrl?: string;
  }): Promise<IChatMessage>;
  getConversation(
    courseId: string,
    userId: string | undefined,
    trainerId: string
  ): Promise<IChatMessage[]>;
  markMessageAsRead(messageId: string): Promise<IChatMessage>;
  editMessage(
    messageId: string,
    senderId: string | undefined,
    updates: { message?: string; mediaUrl?: string }
  ): Promise<IChatMessage>;
  deleteMessage(
    messageId: string,
    senderId: string | undefined
  ): Promise<IChatMessage>;
  getAllConversationsForTrainer(trainerId: string): Promise<IChatMessage[]>;
}
