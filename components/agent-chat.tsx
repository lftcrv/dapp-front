'use client'

import { useChat } from '@/hooks/use-chat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ChatMessage } from '@/lib/types'

interface ChatContentProps {
  messages: ChatMessage[]
  isLoading: boolean
  error: Error | null
  onSendMessage: (content: string) => void
}

function ChatContent({ messages, isLoading, error, onSendMessage }: ChatContentProps) {
  const [input, setInput] = useState('')

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const handleSend = () => {
    if (!input.trim()) return
    onSendMessage(input)
    setInput('')
  }

  return (
    <div className="flex flex-col h-[300px]">
      <ScrollArea className="flex-1 p-4">
        {messages.map(message => (
          <div key={message.id} className={`mb-4 ${message.isCurrentUser ? 'text-right' : ''}`}>
            <div className="text-sm opacity-70">{message.sender}</div>
            <div className="mt-1 text-sm">{message.content}</div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={!input.trim()}>Send</Button>
        </div>
      </div>
    </div>
  )
}

interface AgentChatProps {
  agentId: string
}

export function AgentChat({ agentId }: AgentChatProps) {
  const { messages, isLoading, error, sendMessage } = useChat({ agentId })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <ChatContent 
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSendMessage={sendMessage}
        />
      </CardContent>
    </Card>
  )
} 