import { ChatMessage, IChatMessage } from "../../models/ChatMessage";

export interface IChatService {
  sendMessage(messageData: {
    courseId: string;
    senderId: string | undefined;
    recipientId: string;
    message: string;
  }): Promise<IChatMessage>;
  getConversation(
    courseId: string,
    userId: string | undefined,
    trainerId: string
  ): Promise<IChatMessage[]>;
  markMessageAsRead(messageId: string): Promise<IChatMessage>;
}
