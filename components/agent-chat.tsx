'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { useWallet } from '@/lib/wallet-context'
import { useChat } from '@/hooks/use-chat'
import type { ChatMessage } from '@/lib/types'
import { toast } from 'sonner'
import { Loading } from "@/components/ui/loading"
import { useAgentTheme } from '@/contexts/agent-theme-context'
import { cn } from '@/lib/utils'

interface AgentChatProps {
  agentId: string
}

export function AgentChat({ agentId }: AgentChatProps) {
  const theme = useAgentTheme()
  const { isConnected } = useWallet()
  const { messages, setMessages, isLoading, error } = useChat({ agentId })
  const [input, setInput] = useState('')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loading variant={theme.mode as "leftcurve" | "rightcurve"} size="sm" />
      </div>
    )
  }

  if (error) {
    return <div>Error loading chat</div>
  }

  const handleSend = () => {
    if (!isConnected) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-bold tracking-tight">🚫 ngmi without wallet</span>
          <span className="text-xs opacity-80">connect wallet to start the degen chat frfr</span>
        </div>,
        {
          style: {
            background: theme.mode === "leftcurve" 
              ? "linear-gradient(to right, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.2))"
              : "linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))",
            border: "1px solid " + (theme.mode === "leftcurve" ? "rgba(234, 179, 8, 0.3)" : "rgba(168, 85, 247, 0.3)"),
            color: theme.mode === "leftcurve" ? "#eab308" : "#a855f7",
            fontFamily: "monospace",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)"
          },
          className: "font-mono",
          duration: 4000
        }
      )
      return
    }
    if (!input.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      agentId,
      sender: '0x1234...5678',
      content: input,
      timestamp: new Date().toISOString(),
      isCurrentUser: true
    }

    setMessages((prev: ChatMessage[]) => [...prev, newMessage])
    setInput('')
  }

  return (
    <div className="flex flex-col h-[300px]">
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {messages.map((message: ChatMessage) => (
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