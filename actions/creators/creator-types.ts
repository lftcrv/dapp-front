// Corresponds to LeaderboardQueryDto sortBy field in creator_doc.md
export enum LeaderboardSortField {
  BALANCE = 'balance',
  PNL_CYCLE = 'pnlCycle',
  PNL_24H = 'pnl24h',
  RUNNING_AGENTS = 'runningAgents',
}

// Corresponds to CreatorLeaderboardEntryDto in creator_doc.md (Section 5.5)
export interface CreatorLeaderboardEntryDto {
  creatorId: string;
  name?: string;
  avatarUrl?: string;
  totalAgents: number;
  runningAgents: number;
  totalBalanceInUSD: number;
  aggregatedPnlCycle: number;
  aggregatedPnl24h: number;
  totalTradeCount: number;
  bestAgentId?: string;
  bestAgentPnlCycle?: number;
  updatedAt: string; // ISO date string
}

// Corresponds to PaginatedResponseDto<T> in creator_doc.md (Section 3.2)
export interface PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
} 