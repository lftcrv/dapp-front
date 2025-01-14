import { ChatMessage } from '@/lib/types'
import { ApiResponse } from './types'
import chatData from '@/data/chat-messages.json'

export const chatService = {
  async getMessages(agentId: string): Promise<ApiResponse<ChatMessage[]>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      const messages = chatData.messages
        .filter(msg => msg.agentId === agentId)
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

      return {
        success: true,
        data: messages
      }
    } catch {
      return {
        success: false,
        data: [],
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch chat messages'
        }
      }
    }
  },

  async sendMessage(agentId: string, content: string): Promise<ApiResponse<ChatMessage>> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        agentId,
        sender: '0x123...', // TODO: Use actual wallet address
        content,
        time: new Date().toISOString(),
        isCurrentUser: true
      }

      return {
        success: true,
        data: newMessage
      }
    } catch {
      return {
        success: false,
        data: {} as ChatMessage,
        error: {
          code: 'SEND_FAILED',
          message: 'Failed to send message'
        }
      }
    }
  }
} 