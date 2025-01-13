'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { useWallet } from '@/lib/wallet-context'
import { dummyChatMessages, ChatMessage } from '@/lib/dummy-trades'
import { toast } from 'sonner'

export function AgentChat() {
  const { isConnected } = useWallet()
  const [messages, setMessages] = useState<ChatMessage[]>(dummyChatMessages.slice(0, 10))
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet to chat')
      return
    }
    if (!input.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: '0x1234...5678',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
      isCurrentUser: true
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
  }

  return (
    <div className="flex flex-col h-[300px]">
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.isCurrentUser 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs opacity-75">
                    {message.sender.slice(0, 6)}...{message.sender.slice(-4)}
                  </span>
                  <span className="text-xs opacity-50">•</span>
                  <span className="text-xs opacity-50">{message.timestamp}</span>
                </div>
                <p className="text-sm break-words">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connect wallet to chat..."}
            disabled={!isConnected}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button 
            onClick={handleSend}
            disabled={!isConnected || !input.trim()}
            size="icon"
          >
            📨
          </Button>
        </div>
      </div>
    </div>
  )
} 