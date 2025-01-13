import { type Agent } from './types'

export interface Trade {
  id: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  total: number
  trader: string
  time: string
  summary: string
}

export interface ChatMessage {
  id: string
  sender: string
  content: string
  timestamp: string
  isCurrentUser?: boolean
}

export const dummyTrades: Trade[] = [
  {
    id: 'trade-1',
    type: 'buy',
    amount: 0.5,
    price: 2500,
    total: 1250,
    trader: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    time: '2m ago',
    summary: 'Long ETH: Strong momentum on L2 adoption + upcoming protocol upgrade. Technical indicators showing bullish divergence on 4H.'
  },
  {
    id: 'trade-2',
    type: 'sell',
    amount: 1000,
    price: 1.05,
    total: 1050,
    trader: '0x123d35Cc6634C0532925a3b844Bc454e4438f123',
    time: '5m ago',
    summary: 'Exit USDC: Depegging risk + bearish market sentiment. Moving to stables with better backing ratio and regulatory clarity.'
  },
  {
    id: 'trade-3',
    type: 'buy',
    amount: 0.1,
    price: 45000,
    total: 4500,
    trader: '0x456d35Cc6634C0532925a3b844Bc454e4438f456',
    time: '12m ago',
    summary: 'BTC accumulation: RSI oversold + whale wallets accumulating. Multiple technical supports converging at 44k level.'
  },
  {
    id: 'trade-4',
    type: 'sell',
    amount: 5,
    price: 2300,
    total: 11500,
    trader: '0x789d35Cc6634C0532925a3b844Bc454e4438f789',
    time: '15m ago',
    summary: 'Short ETH: Rising rates + macro headwinds. Breaking below 200MA with increasing volume, targeting 2100 support.'
  },
  {
    id: 'trade-5',
    type: 'buy',
    amount: 2500,
    price: 1.02,
    total: 2550,
    trader: '0xabcd35Cc6634C0532925a3b844Bc454e4438fabc',
    time: '18m ago',
    summary: 'Long SOL: Network metrics improving + institutional inflows. Breaking out of falling wedge with volume confirmation.'
  }
]

export const dummyChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    content: 'This agent is crushing it on ETH trades 🚀',
    timestamp: '2h ago',
    isCurrentUser: false
  },
  {
    id: 'msg-2',
    sender: '0x123d35Cc6634C0532925a3b844Bc454e4438f123',
    content: 'Anyone else seeing these gains? 📈',
    timestamp: '3h ago',
    isCurrentUser: true
  },
  {
    id: 'msg-3',
    sender: '0x456d35Cc6634C0532925a3b844Bc454e4438f456',
    content: 'Smart move longing BTC here anon',
    timestamp: '4h ago',
    isCurrentUser: false
  },
  {
    id: 'msg-4',
    sender: '0x789d35Cc6634C0532925a3b844Bc454e4438f789',
    content: 'ngmi with these paper hands 😤',
    timestamp: '5h ago',
    isCurrentUser: false
  },
  {
    id: 'msg-5',
    sender: '0xabcd35Cc6634C0532925a3b844Bc454e4438fabc',
    content: 'Degen mode activated 🦧',
    timestamp: '6h ago',
    isCurrentUser: true
  }
] 