'use server';

import { callApi } from './api-utils';

export interface CurrentBalance {
  agentId: string;
  currentBalance: number;
  timestamp: string;
}

/**
 * Fetches the current balance for a specific agent
 */
export async function getCurrentBalance(agentId: string) {
  try {
    const response = await callApi<CurrentBalance>(
      `/api/kpi/balance/${agentId}/current`,
      'GET'
    );

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error fetching current balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 