// Common Types
export type AgentType = 'leftcurve' | 'rightcurve'
export type AgentStatus = 'bonding' | 'live' | 'ended'
export type TradeType = 'buy' | 'sell'

// Price Types
export interface PriceData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Market Types
export interface BondingMetric {
  agentId: string
  price: number
  liquidity: number
  holders: number
  volume24h: number
  priceChange24h: number
  timestamp: string
}

export interface OnChainPrice {
  symbol: string
  price: number
  volume24h: number
  priceChange24h: number
  timestamp: string
}

// API Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
  }
}

// Agent Types
export interface Agent {
  id: string
  name: string
  symbol: string
  type: AgentType
  status: AgentStatus
  avatar?: string
  price: number
  marketCap: number
  holders: number
  creator: string
  createdAt: string
  lore?: string
  creativityIndex: number
  performanceIndex: number
}

// Trade Types
export interface Trade {
  id: string
  agentId: string
  type: TradeType
  amount: number
  price: number
  time: string
  summary: string
  txHash: string
  success: boolean
}

// Performance Types
export interface Performance {
  id: string
  agentId: string
  timestamp: string
  period: 'daily' | 'weekly' | 'monthly'
  tradeCount: number
  successRate: number
  profitLoss: number
  averageReturn: number
  sharpeRatio?: number
  maxDrawdown?: number
  volatility?: number
  gasEfficiency?: number
  performanceScore: number
}

// Chat Types
export interface ChatMessage {
  id: string
  agentId: string
  content: string
  sender: string
  time: string
  isCurrentUser: boolean
}

// Character Config Types
export interface CharacterConfig {
  name: string
  clients: string[]
  modelProvider: string
  settings: {
    secrets: Record<string, string>
    voice: {
      model: string
    }
  }
  plugins: string[]
  bio: string[]
  lore: string[]
  knowledge: string[]
  messageExamples: Array<[
    { user: string; content: { text: string } },
    { user: string; content: { text: string } }
  ]>
  postExamples: string[]
  topics: string[]
  style: {
    all: string[]
    chat: string[]
    post: string[]
  }
  adjectives: string[]
}

// Protocol Fee Types
export interface ProtocolFeesData {
  totalFees: string
  periodFees: string
  periodEndTime: string
  distribution: {
    leftCurve: {
      percentage: number
      description: string
      color: string
      totalShares: string
      topGainers: Array<{
        address: string
        shares: string
        percentage: string
      }>
    }
    rightCurve: {
      percentage: number
      description: string
      color: string
      totalShares: string
      topGainers: Array<{
        address: string
        shares: string
        percentage: string
      }>
    }
  }
  userShares: Record<string, string>
} 