import { useState, useEffect } from 'react'
import { ChatMessage } from '@/lib/types'
import { chatService } from '@/lib/services/api/chat'
import { useToast } from '@/hooks/use-toast'

interface UseChatOptions {
  agentId: string
  initialData?: ChatMessage[]
}

export function useChat({ agentId, initialData }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialData || [])
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchMessages() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await chatService.getMessages(agentId)
        if (response.success) {
          setMessages(response.data)
        } else {
          throw new Error(response.error?.message || 'Failed to fetch messages')
        }
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

  const sendMessage = async (content: string) => {
    try {
      const response = await chatService.sendMessage(agentId, content)
      if (response.success) {
        setMessages(prev => [response.data, ...prev])
      } else {
        toast({
          title: 'Error',
          description: response.error?.message || 'Failed to send message',
          variant: 'destructive'
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      })
    }
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage
  }
} 