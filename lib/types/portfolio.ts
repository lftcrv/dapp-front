// Types for Agent Portfolio data

// PnL for a specific agent
export interface AgentPnL {
  agentId: string;
  runtimeAgentId: string;
  name: string;
  pnl: number;
  pnlPercentage: number;
  firstBalanceDate: string;
  latestBalanceDate: string;
  firstBalance: number;
  latestBalance: number;
}

// Agent balance record
export interface BalanceRecord {
  id: string;
  agentId: string;
  balanceInUSD: number;
  createdAt: string;
}

// Balance history item
export interface BalanceHistoryItem {
  id: string;
  balanceInUSD: number;
  createdAt: string;
}

// Balance history response
export interface BalanceHistory {
  agentId: string;
  balances: BalanceHistoryItem[];
}

// Current balance response
export interface CurrentBalance {
  agentId: string;
  currentBalance: number;
  timestamp: string;
}

// Performance snapshot for agent
export interface PerformanceSnapshot {
  id?: string;
  agentId: string;
  timestamp: string;
  balanceInUSD: number;
  pnl: number;
  pnlPercentage: number;
  pnl24h: number;
  pnlCycle: number;
  tradeCount: number;
  tvl: number;
  price: number;
  marketCap: number;
  dataPoints?: number; // For aggregated data
}

// Performance history response with interval
export interface PerformanceHistory {
  agentId: string;
  interval: 'hourly' | 'daily' | 'weekly';
  snapshots: PerformanceSnapshot[];
}

// Asset allocation data from /api/kpi/portfolio/{agentId}
export interface AssetAllocation {
  agentId: string;
  runtimeAgentId: string;
  name: string;
  timestamp: string;
  balanceInUSD: number;
  portfolio: {
    symbol: string;
    balance: number;
    price: number;
    valueUsd: number;
    percentage: number;
  }[];
}

// Performance metrics data
export interface PerformanceMetrics {
  agentId: string;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
  winRate?: number;
  averageTradeSize?: number;
  tradeFrequency?: number;
}

// API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PnLResponse {
  agentId: string;
  runtimeAgentId: string;
  name: string;
  pnl: number;
  pnlPercentage: number;
  firstBalanceDate: string;
  latestBalanceDate: string;
  firstBalance: number;
  latestBalance: number;
}

export interface BestPerformingAgentResponse {
  message: string;
  bestAgent: AgentPnL;
}

export interface PerformanceHistoryResponse {
  agentId: string;
  interval: 'hourly' | 'daily' | 'weekly';
  snapshots: PerformanceSnapshot[];
}

// Query parameters
export interface PerformanceHistoryParams {
  interval?: 'hourly' | 'daily' | 'weekly';
  from?: string;
  to?: string;
} 