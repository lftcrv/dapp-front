'use server';

import { BalanceHistory } from '@/lib/types';
import { callApi } from './api-utils';

/**
 * Fetches the balance history for a specific agent
 */
export async function getBalanceHistory(agentId: string) {
  try {
    const result = await callApi<BalanceHistory>(`/api/kpi/balance/${agentId}`, 'GET');
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error fetching balance history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 