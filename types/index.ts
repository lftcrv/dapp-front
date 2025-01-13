// Agent types
export interface Agent {
  agentId: string
  name: string
  price: number
  holders: number
  status: AgentStatus
  creator?: string
  description?: string
  tradingStrategy?: string
  twitterHandle?: string
}

export type AgentStatus = 'bonding' | 'live' | 'ended'

// Wallet types
export interface WalletInfo {
  address: string
  network: string
  balance?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
  }
}

// Form types
export interface CreateAgentForm {
  name: string
  lore: string
  personality: string
  tradingStrategy?: string
  twitterHandle?: string
}

// Table types
export interface SortConfig<T> {
  key: keyof T
  direction: 'asc' | 'desc'
} 