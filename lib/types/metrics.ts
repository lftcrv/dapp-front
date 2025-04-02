// Types for global and agent-specific metrics

// Global metrics
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

// Agent-specific metrics
export interface AgentTradeCount {
  agentId: string;
  name: string;
  tradeCount: number;
}

// Combined metrics for dashboard/home page
export interface GlobalMetrics {
  totalAgentCount: number;
  totalTradeCount: number;
  totalTVL: number;
  totalBalance: number;
} 