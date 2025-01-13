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