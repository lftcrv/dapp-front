import { BondingMetric, OnChainPrice } from '@/lib/types'
import { ApiResponse, PriceHistoryParams, TimeRangeParams } from './types'

const API_BASE = '/api/market'

// Bonding curve endpoints
export async function getBondingMetrics(agentId: string): Promise<ApiResponse<BondingMetric>> {
  const response = await fetch(`${API_BASE}/bonding/${agentId}`)
  return response.json()
}

export async function getBondingHistory(agentId: string, params?: TimeRangeParams): Promise<ApiResponse<BondingMetric[]>> {
  const queryParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString())
    })
  }
  
  const response = await fetch(`${API_BASE}/bonding/${agentId}/history?${queryParams.toString()}`)
  return response.json()
}

// On-chain market price endpoints
export async function getMarketPrice(symbol: string): Promise<ApiResponse<OnChainPrice>> {
  const response = await fetch(`${API_BASE}/price/${symbol}`)
  return response.json()
}

export async function getMarketPriceHistory(params: PriceHistoryParams): Promise<ApiResponse<OnChainPrice[]>> {
  const queryParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, value.toString())
  })
  
  const response = await fetch(`${API_BASE}/price/history?${queryParams.toString()}`)
  return response.json()
}

// Market statistics
export async function getMarketStats(): Promise<ApiResponse<{
  totalValueLocked: number
  totalAgents: {
    all: number
    leftcurve: number
    rightcurve: number
  }
  statusDistribution: {
    bonding: number
    live: number
    ended: number
  }
  volume24h: {
    bonding: number  // Volume from bonding curves
    market: number   // Volume from on-chain trading
    total: number    // Combined volume
  }
  trades24h: {
    bonding: number
    market: number
    total: number
  }
}>> {
  const response = await fetch(`${API_BASE}/stats`)
  return response.json()
}

// Trending data
export async function getTrendingAgents(limit: number = 5): Promise<ApiResponse<Array<{
  agentId: string
  symbol: string
  status: 'bonding' | 'live' | 'ended'
  priceChange24h: number
  volumeChange24h: number
  holdersChange24h: number
  source: 'bonding' | 'market' // Indicates if metrics are from bonding or market
}>>> {
  const response = await fetch(`${API_BASE}/trending?limit=${limit}`)
  return response.json()
}

// Market overview combining both bonding and on-chain data
export async function getMarketOverview(): Promise<ApiResponse<{
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
    type: 'buy' | 'sell'
    price: number
    amount: number
    timestamp: string
    source: 'bonding' | 'market'
  }>
}>> {
  const response = await fetch(`${API_BASE}/overview`)
  return response.json()
} 