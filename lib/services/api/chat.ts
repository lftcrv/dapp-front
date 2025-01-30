import { ChatMessage } from "@/lib/types";
import { BaseService } from "@/lib/core/service";
import { withErrorHandling, Result } from "@/lib/core/error-handler";
import chatData from "@/data/chat-messages.json";

export class ChatService extends BaseService<ChatMessage> {
  async getAll(): Promise<Result<ChatMessage[]>> {
    return withErrorHandling(async () => {
      return chatData.messages;
    }, "Failed to fetch messages");
  }

  async getById(id: string): Promise<Result<ChatMessage>> {
    return withErrorHandling(async () => {
      const message = chatData.messages.find((msg) => msg.id === id);
      if (!message) throw new Error("Message not found");
      return message;
    }, "Failed to fetch message");
  }

  async getByAgent(agentId: string): Promise<Result<ChatMessage[]>> {
    return withErrorHandling(async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return chatData.messages
        .filter((msg) => msg.agentId === agentId)
        .sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
        );
    }, "Failed to fetch chat messages");
  }

  async sendMessage(
    agentId: string,
    content: string,
  ): Promise<Result<ChatMessage>> {
    return withErrorHandling(async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        agentId,
        sender: "0x123...", // TODO: Use actual wallet address
        content,
        time: new Date().toISOString(),
        isCurrentUser: true,
      };

      return newMessage;
    }, "Failed to send message");
  }
}

export const chatService = new ChatService();
