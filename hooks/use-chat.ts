import { useEffect } from 'react'
import { ChatMessage } from '@/lib/types'
import { chatService } from '@/lib/services/api/chat'
import { useAsyncState } from '@/lib/core/state'
import { useToast } from '@/hooks/use-toast'

interface UseChatOptions {
  agentId: string
  initialData?: ChatMessage[]
}

export function useChat({ agentId, initialData }: UseChatOptions) {
  const state = useAsyncState<ChatMessage[]>(initialData)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchMessages() {
      if (initialData) return
      
      state.setLoading(true)
      const result = await chatService.getByAgent(agentId)
      state.handleResult(result)
    }

    fetchMessages()
  }, [agentId, initialData])

  const sendMessage = async (content: string) => {
    const result = await chatService.sendMessage(agentId, content)
    
    if (result.success && result.data) {
      state.setData([result.data, ...(state.data || [])])
    } else {
      toast({
        title: 'Error',
        description: result.error?.message || 'Failed to send message',
        variant: 'destructive'
      })
    }
  }

  return {
    messages: state.data || [],
    isLoading: state.isLoading,
    error: state.error,
    sendMessage
  }
} 