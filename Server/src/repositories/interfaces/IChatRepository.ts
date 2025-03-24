import { IChatMessage } from "../../models/ChatMessage";

export interface IChatRepository {
  saveMessage(message: Partial<IChatMessage>): Promise<IChatMessage>;
  getMessages(
    courseId: string,
    userId: string | undefined,
    trainerId: string
  ): Promise<IChatMessage[]>;
  markAsRead(messageId: string): Promise<IChatMessage>;
  getAllMessagesForTrainer(trainerId: string): Promise<IChatMessage[]>;
  getMessageById(messageId: string): Promise<IChatMessage | null>;
  updateMessage(
    messageId: string,
    updates: {
      message?: string;
      mediaUrl?: string;
      isDeleted?: boolean;
      isEdited?: boolean;
    }
  ): Promise<IChatMessage>;
  deleteMessage(messageId: string): Promise<IChatMessage>;
}
