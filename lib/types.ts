// Agent Types
export type AgentType = 'leftcurve' | 'rightcurve'
export type AgentStatus = 'bonding' | 'live' | 'ended'
export type TradeType = 'buy' | 'sell'

export interface Agent {
  id: string
  name: string
  avatar: string
  type: AgentType
  status: AgentStatus
  symbol: string
  price: number
  holders: number
  marketCap: number
  creativityIndex: number
  performanceIndex: number
  creator: string
  createdAt: string
  lore?: string
  description?: string
  tradingStrategy?: string
  twitterHandle?: string
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

// Price Types
export interface BondingMetric {
  id: string
  agentId: string
  timestamp: string
  currentPrice: number
  targetPrice: number
  bondingProgress: number
  liquidity: number
  holdersCount: number
  volume24h: number
  remainingSupply: number
  issuanceRate: number
  estimatedTime?: string
}

export interface OnChainPrice {
  id: string
  symbol: string
  blockNumber: string
  timestamp: string
  price: number
  volume: number
  liquidity: number
  holders: number
  marketCap: number
  txHash?: string
  source: string
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

// Market Overview Types
export interface MarketOverview {
  bondingMetrics: {
    totalAgents: number
    totalHolders: number
    totalLiquidity: number
    volume24h: number
  }
  marketMetrics: {
    totalAgents: number
    totalHolders: number
    totalLiquidity: number
    volume24h: number
  }
  topPerformers: Array<{
    agentId: string
    symbol: string
    performanceScore: number
    priceChange24h: number
    source: 'bonding' | 'market'
  }>
  recentTrades: Array<{
    agentId: string
    symbol: string
    type: TradeType
    price: number
    amount: number
    timestamp: string
    source: 'bonding' | 'market'
  }>
}

// Wallet Types
export interface WalletInfo {
  address: string
  network: string
  balance?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
  }
}

// Form Types
export interface CreateAgentForm {
  name: string
  lore: string
  personality: string
  tradingStrategy?: string
  twitterHandle?: string
}

// Table Types
export interface SortConfig<T> {
  key: keyof T
  direction: 'asc' | 'desc'
}

export interface PriceData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

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
  userShares: {
    [key: string]: string
  }
} 