import { Abi } from 'starknet';

// Common Types
export type AgentType = 'leftcurve' | 'rightcurve';
export type AgentStatus = 'bonding' | 'live' | 'ended';
export type TradeType = 'buy' | 'sell' | 'cancel' | 'unknown';

// Core Service Types
export interface IBaseService<T> {
  get(): Promise<T>;
  set(value: T): Promise<void>;
  clear(): Promise<void>;
}

export interface ISingletonService<T> {
  getInstance(): Promise<T>;
}

export interface IServiceConfig {
  storage?: Storage;
  prefix?: string;
}

// API Parameter Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface TimeRangeParams {
  startTime?: string;
  endTime?: string;
}

export interface MarketMetricsParams extends PaginationParams, TimeRangeParams {
  agentId?: string;
  type?: string;
}

export interface PerformanceParams extends PaginationParams, TimeRangeParams {
  agentId: string;
  period?: 'daily' | 'weekly' | 'monthly';
}

export interface PriceHistoryParams extends TimeRangeParams {
  agentId: string;
  resolution?: string;
  limit?: number;
}

export interface TradeHistoryParams extends PaginationParams, TimeRangeParams {
  agentId?: string;
  type?: TradeType;
  status?: 'success' | 'failed';
}

export interface LeaderboardParams extends PaginationParams {
  type?: AgentType;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface AgentFilters extends PaginationParams {
  search?: string;
  type?: AgentType;
  status?: AgentStatus;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// State Types
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface SwapState {
  amount: string;
  estimatedReturn: string;
  slippage: number;
  error: string | null;
}

export interface SwapResult {
  success: boolean;
  hash?: string;
  error?: string;
}

// Stats Types
export interface AgentStats {
  price: string;
  marketCap: string;
  holders: number;
  score: number;
}

// Price Types
export interface PriceData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Market Types
export interface BondingMetric {
  agentId: string;
  price: number;
  liquidity: number;
  holders: number;
  volume24h: number;
  priceChange24h: number;
  timestamp: string;
}

export interface OnChainPrice {
  symbol: string;
  price: number;
  volume24h: number;
  priceChange24h: number;
  timestamp: string;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface GetTradesResponse {
  status: 'success' | 'error';
  data: {
    trades: ApiTrade[];
    trade?: ApiTrade;
  };
}

export interface TokenSimulationResponse {
  status: string;
  data: {
    amount: string;
  };
}

export interface BondingCurveResponse {
  status: string;
  data: {
    percentage: number;
  };
}

export interface CurrentPriceResponse {
  status: string;
  data: {
    price: string;
  };
}

export interface MarketCapResponse {
  status: string;
  data: {
    marketCap: string;
  };
}

export interface PriceHistoryResponse {
  status: string;
  data: {
    prices: {
      id: string;
      price: string;
      timestamp: string;
    }[];
    tokenSymbol: string;
    tokenAddress: string;
  };
}

export interface TokenMarketDataResponse {
  status: string;
  data: TokenMarketData;
}

export interface ApiAgent {
  id: string;
  name: string;
  curveSide: 'LEFT' | 'RIGHT';
  status: 'STARTING' | 'RUNNING' | 'STOPPED';
  createdAt: string;
  degenScore: number;
  winScore: number;
  profilePicture: string | null;
  profilePictureUrl: string | null;
  Token: {
    // Note: Capital T to match Prisma model
    contractAddress: string;
    elizaAgentId: string;
  };
  Wallet: {
    // Note: Capital W to match Prisma model
    contractAddress: string;
    deployedAddress: string;
    elizaAgentId: string;
  };
  LatestMarketData: {
    price: number;
    priceChange24h: number;
    marketCap: number;
    holders: number;
    updatedAt: string;
    pnlCycle?: number;
    pnl24h?: number;
    tradeCount?: number;
    tvl?: number;
    balanceInUSD?: number;
    pnlRank?: number;
    bondingStatus?: 'BONDING' | 'LIVE';
    forkCount?: number;
  } | null;
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  symbol: string;
  type: AgentType;
  status: AgentStatus;
  price: number;
  marketCap: number;
  holders: number;
  creator: string;
  createdAt: string;
  lore?: string;
  description?: string;
  creativityIndex: number;
  performanceIndex: number;
  contractAddress: `0x${string}`;
  abi: Abi;
  profilePicture?: string;
  profilePictureUrl?: string;
  buyTax?: number;
  sellTax?: number;
  priceChange24h?: number;
  cycleRanking?: number;
  pnl24h?: number;
  pnlCycle?: number;
  tradeCount?: number;
  tvl?: number;
  forkerCount?: number;
  characterConfig?: CharacterConfig;
  latestMarketData?: {
    price: number;
    priceChange24h: number;
    holders: number;
    marketCap: number;
    bondingStatus: 'BONDING' | 'LIVE';
  };
}

export interface BaseTradeInfo {
  tradeId: string;
  containerId?: string;
}

export interface MarketOrderTradeInfo extends BaseTradeInfo {
  tradeType: 'paradexPlaceOrderMarket';
  trade: {
    market: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET PRICE';
    size: string;
    instruction: string;
    explanation: string;
  };
}

export interface LimitOrderTradeInfo extends BaseTradeInfo {
  tradeType: 'paradexPlaceOrderLimit';
  trade: {
    market: string;
    side: 'BUY' | 'SELL';
    type: 'LIMIT';
    size: string;
    price: string;
    instruction: string;
    explanation: string;
  };
}

export interface CancelOrderTradeInfo extends BaseTradeInfo {
  tradeType: 'paradexCancelOrder';
  explanation: string;
}

// Legacy TradeInfo for backward compatibility
export interface LegacyTradeInfo {
  buyAmount: string;
  sellAmount: string;
  explanation: string;
  buyTokenName: string;
  sellTokenName: string;
  tradePriceUSD: number;
  buyTokenAddress: string;
  sellTokenAddress: string;
}

// Union type for all possible trade information types
export type TradeInfo =
  | MarketOrderTradeInfo['trade']
  | LimitOrderTradeInfo['trade']
  | LegacyTradeInfo;

export interface ApiTrade {
  id: string;
  time?: string;
  createdAt?: string;
  information:
    | MarketOrderTradeInfo
    | LimitOrderTradeInfo
    | CancelOrderTradeInfo
    | {
        trade: LegacyTradeInfo;
        tradeId: string;
        containerId?: string;
      };
  elizaAgentId: string;
}

export interface Trade {
  id: string;
  agentId: string;
  type: TradeType;
  amount?: number;
  price?: number | string;
  time: string;
  summary: string;
  txHash: string;
  success: boolean;
  information?: ApiTrade['information'];
}

// Performance Types
export interface Performance {
  id: string;
  agentId: string;
  timestamp: string;
  period: 'daily' | 'weekly' | 'monthly';
  tradeCount: number;
  successRate: number;
  profitLoss: number;
  averageReturn: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
  volatility?: number;
  gasEfficiency?: number;
  performanceScore: number;
}

// Chat Types
export interface ChatMessage {
  id: string;
  agentId: string;
  content: string;
  sender: string;
  time: string;
  isCurrentUser: boolean;
}

// Character Config Types
export interface CharacterConfig {
  name: string;
  clients: string[];
  modelProvider: string;
  settings: {
    secrets: Record<string, string>;
    voice: {
      model: string;
    };
  };
  plugins: string[];
  bio: string[];
  objectives: string[];
  lore: string[];
  knowledge: string[];
  messageExamples: Array<
    [
      { user: string; content: { text: string } },
      { user: string; content: { text: string } },
    ]
  >;
  postExamples: string[];
  topics: string[];
  style: {
    all: string[];
    chat: string[];
    post: string[];
  };
  adjectives: string[];
}

export interface AgentConfig {
  name: string;
  bio: string;
  lore: string[];
  objectives: string[];
  knowledge: string[];
  interval: number;
  chat_id: string;
  external_plugins: string[];
  internal_plugins: string[];
}

// Protocol Fee Types
export interface ProtocolFeesData {
  totalFees: string;
  periodFees: string;
  periodEndTime: string;
  distribution: {
    leftCurve: {
      percentage: number;
      description: string;
      color: string;
      totalShares: string;
      topGainers: Array<{
        address: string;
        shares: string;
        percentage: string;
      }>;
    };
    rightCurve: {
      percentage: number;
      description: string;
      color: string;
      totalShares: string;
      topGainers: Array<{
        address: string;
        shares: string;
        percentage: string;
      }>;
    };
  };
  userShares: Record<string, string>;
}

export interface User {
  id: string;
  evmAddress?: string;
  starknetAddress?: string;
  name?: string;
  twitter?: string;
  lastConnection: string;
  createdAt: string;
  updatedAt: string;
  type: 'derived' | 'starknet_native';
}

export interface TokenMarketData {
  price: string | null;
  priceChange24h: number | null;
  marketCap: number | null;
  bondingStatus: 'BONDING' | 'LIVE';
  holders: number | null;
}

// Metrics types
export interface TotalAgentCount {
  totalAgentCount: number;
}

export interface TotalTradeCount {
  totalTradeCount: number;
}

export interface TotalTVL {
  totalTVL: number;
}

export interface TotalBalance {
  totalBalance: number;
}

export interface AgentTradeCount {
  agentId: string;
  name: string;
  tradeCount: number;
}

export interface GlobalMetrics {
  totalAgentCount: number;
  totalTradeCount: number;
  totalTVL: number;
  totalBalance: number;
}

// Portfolio types
export interface AssetAllocation {
  agentId: string;
  assets: {
    symbol: string;
    name: string;
    value: number;
    percentage: number;
  }[];
  timestamp: string;
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
  dataPoints?: number;
}

export interface PerformanceHistory {
  agentId: string;
  interval: 'hourly' | 'daily' | 'weekly';
  snapshots: PerformanceSnapshot[];
}

export interface PerformanceHistoryParams {
  interval?: 'hourly' | 'daily' | 'weekly';
  from?: string;
  to?: string;
}

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

export interface BalanceHistoryItem {
  id: string;
  balanceInUSD: number;
  createdAt: string;
}

export interface BalanceHistory {
  agentId: string;
  balances: BalanceHistoryItem[];
}

export interface CurrentBalance {
  agentId: string;
  currentBalance: number;
  timestamp: string;
}
