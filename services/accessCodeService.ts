import { AccessCode, AccessCodeActivity, AccessCodeDashboard, GenerationParams } from '../types/accessCode';

const API_BASE_URL = '/api/access-codes';

export const accessCodeService = {
  /**
   * Generate a new access code
   */
  generateCode: async (params: GenerationParams): Promise<AccessCode> => {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate access code');
    }

    return response.json();
  },

  /**
   * Validate an access code
   */
  validateCode: async (code: string, userId: string): Promise<{ isValid: boolean; accessCode?: AccessCode; error?: string }> => {
    const response = await fetch(`${API_BASE_URL}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, userId }),
    });

    return response.json();
  },

  /**
   * Get system status
   */
  getStatus: async (): Promise<{ isEnabled: boolean; totalCodes: number; activeCodes: number; usedToday: number }> => {
    const response = await fetch(`${API_BASE_URL}/status`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch system status');
    }

    return response.json();
  },

  /**
   * Disable an access code
   */
  disableCode: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/disable`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error('Failed to disable access code');
    }

    return response.json();
  },

  /**
   * Get access code statistics
   */
  getStats: async (): Promise<AccessCodeDashboard['stats'] & {
    byType: Record<string, number>;
    usageHistory: Array<{ date: string; count: number }>;
  }> => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch access code statistics');
    }

    return response.json();
  },

  /**
   * Get all access codes with optional filtering
   */
  getCodes: async (
    filters?: {
      status?: string;
      type?: string[];
      search?: string;
      dateStart?: string;
      dateEnd?: string;
    },
    sort?: {
      field: string;
      direction: 'asc' | 'desc';
    },
    pagination?: {
      page: number;
      pageSize: number;
    }
  ): Promise<{ codes: AccessCode[]; total: number }> => {
    // Build query string
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.type && filters.type.length) filters.type.forEach(t => params.append('type', t));
      if (filters.search) params.append('search', filters.search);
      if (filters.dateStart) params.append('dateStart', filters.dateStart);
      if (filters.dateEnd) params.append('dateEnd', filters.dateEnd);
    }
    
    if (sort) {
      params.append('sortField', sort.field);
      params.append('sortDirection', sort.direction);
    }
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('pageSize', pagination.pageSize.toString());
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/list${queryString}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch access codes');
    }

    return response.json();
  },

  /**
   * Get a specific access code by ID
   */
  getCodeById: async (id: string): Promise<{ accessCode: AccessCode; activities: AccessCodeActivity[] }> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch access code details');
    }

    return response.json();
  },

  /**
   * Renew an access code
   */
  renewCode: async (id: string, params: { expiresAt?: string; maxUses?: number }): Promise<AccessCode> => {
    const response = await fetch(`${API_BASE_URL}/renew`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...params }),
    });

    if (!response.ok) {
      throw new Error('Failed to renew access code');
    }

    return response.json();
  }
}; 