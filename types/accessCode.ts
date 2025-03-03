export type CodeType = 'ADMIN' | 'REFERRAL' | 'TEMPORARY';

export interface AccessCode {
  id: string;
  code: string;
  createdAt: string;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  createdBy?: string;
  isActive: boolean;
  type: CodeType;
  description?: string;
}

export interface AccessCodeActivity {
  id: string;
  codeId: string;
  code: string;
  action: 'CREATED' | 'USED' | 'DISABLED' | 'RENEWED';
  timestamp: string;
  userId?: string;
  details?: string;
}

export interface AccessCodeDashboard {
  stats: {
    totalCodes: number;
    activeCodes: number;
    usedCodes: number;
    expiringCodes: number;
  };
  recentActivity: AccessCodeActivity[];
}

export interface GenerationParams {
  type: CodeType;
  maxUses?: number;
  expiresAt?: string;
  description?: string;
  count?: string | number;
}

export interface CodeFilters {
  status: 'all' | 'active' | 'expired' | 'disabled';
  type: CodeType[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface SortOptions {
  field: 'createdAt' | 'expiresAt' | 'currentUses' | 'type';
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminDashboardState {
  stats: AccessCodeDashboard['stats'];
  codes: AccessCode[];
  filters: CodeFilters;
  sorting: SortOptions;
  pagination: PaginationState;
  selectedCode?: AccessCode;
} 