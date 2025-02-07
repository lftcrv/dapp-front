import type { Trade, ChatMessage } from '@/lib/types';
import tradesData from '@/data/trades.json' assert { type: 'json' };
import chatData from '@/data/chat-messages.json' assert { type: 'json' };

export const dummyTrades = tradesData.trades as Trade[];
export const dummyChatMessages = chatData.messages as ChatMessage[];
