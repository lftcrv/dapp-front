'use server';

import { CurrentBalance } from '@/lib/types';
import { callApi } from './api-utils';

/**
 * Fetches the current balance for a specific agent
 */
export async function getCurrentBalance(agentId: string) {
  try {
    const result = await callApi<CurrentBalance>(
      `/api/kpi/balance/${agentId}/current`,
      'GET'
    );
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error fetching current balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 