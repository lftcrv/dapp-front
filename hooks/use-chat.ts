import { useState, useEffect } from 'react'
import type { ChatMessage } from '@/lib/types'
import chatData from '@/data/chat-messages.json'

interface UseChatOptions {
  agentId?: string
  initialData?: ChatMessage[]
}

export function useChat({ agentId, initialData }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialData || [])
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchMessages() {
      try {
        setIsLoading(true)
        setError(null)
        const filtered = agentId 
          ? chatData.messages.filter(m => m.agentId === agentId)
          : chatData.messages
        setMessages(filtered)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch messages'))
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialData) {
      fetchMessages()
    }
  }, [agentId, initialData])

  return { messages, setMessages, isLoading, error }
} 