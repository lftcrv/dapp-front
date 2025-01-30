'use client';

import { useChat } from '@/hooks/use-chat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useCallback, memo } from 'react';
import { ChatMessage } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageItem = memo(({ message }: ChatMessageProps) => (
  <div className={`mb-4 ${message.isCurrentUser ? 'text-right' : ''}`}>
    <div className="text-sm opacity-70">{message.sender}</div>
    <div className="mt-1 text-sm">{message.content}</div>
  </div>
));
ChatMessageItem.displayName = 'ChatMessageItem';

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

const ChatInput = memo(({ onSendMessage, disabled }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSendMessage(input);
      setInput('');
    } finally {
      setIsSubmitting(false);
    }
  }, [input, isSubmitting, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyDown}
          disabled={disabled || isSubmitting}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || disabled || isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
});
ChatInput.displayName = 'ChatInput';

interface ChatContentProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  onSendMessage: (content: string) => Promise<void>;
}

const ChatContent = memo(
  ({ messages, isLoading, error, onSendMessage }: ChatContentProps) => {
    if (isLoading) {
      return (
        <div className="flex flex-col gap-4 p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            {error.message || 'Failed to load chat messages'}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="flex flex-col h-[300px]">
        <ScrollArea className="flex-1 p-4">
          {messages.map((message) => (
            <ChatMessageItem key={message.id} message={message} />
          ))}
        </ScrollArea>
        <ChatInput onSendMessage={onSendMessage} />
      </div>
    );
  },
);
ChatContent.displayName = 'ChatContent';

interface AgentChatProps {
  agentId: string;
}

export function AgentChat({ agentId }: AgentChatProps) {
  const { messages, isLoading, error, sendMessage } = useChat({ agentId });

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
  );
}
