import { AgentType, AgentStatus, TradeType } from '@/lib/types'

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
  }
}

// Query Parameters
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface TimeRangeParams {
  startTime?: string
  endTime?: string
}

export interface MarketMetricsParams extends PaginationParams, TimeRangeParams {
  agentId: string
}

export interface PerformanceParams extends PaginationParams, TimeRangeParams {
  agentId: string
  period: 'daily' | 'weekly' | 'monthly'
}

export interface PriceHistoryParams extends TimeRangeParams {
  symbol: string
  interval?: '15m' | '1h' | '4h' | '1d'
}

export interface TradeHistoryParams extends PaginationParams, TimeRangeParams {
  agentId: string
  type?: 'buy' | 'sell'
}

// Leaderboard Types
export interface LeaderboardParams extends PaginationParams {
  sortBy?: 'performanceScore' | 'profitLoss' | 'successRate' | 'marketCap' | 'holders'
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all'
  type?: 'leftcurve' | 'rightcurve'
  status?: 'bonding' | 'live' | 'ended'
}

// Agent Types
export interface AgentFilters extends PaginationParams {
  type?: 'leftcurve' | 'rightcurve'
  status?: 'bonding' | 'live' | 'ended'
  minPrice?: number
  maxPrice?: number
  minHolders?: number
  maxHolders?: number
}

// API Error Types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Agent Service Types
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

// Trade Service Types
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

// Price Service Types
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

// Chat Service Types
export interface ChatMessage {
  id: string
  agentId: string
  content: string
  sender: string
  time: string
  isCurrentUser: boolean
}

// Performance Service Types
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
    type: string
    price: number
    amount: number
    timestamp: string
    source: 'bonding' | 'market'
  }>
}

// Price Data Types
export interface PriceData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
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
  userShares: {
    [key: string]: string
  }
} 