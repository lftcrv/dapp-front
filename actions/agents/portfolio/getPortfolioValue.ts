'use server';

import { PnLResponse } from '@/lib/types';
import { callApi } from './api-utils';

/**
 * Fetches the current portfolio value and PnL information for a specific agent
 */
export async function getPortfolioValue(agentId: string) {
  try {
    const result = await callApi<PnLResponse>(`/api/kpi/pnl/${agentId}`, 'GET');
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error fetching portfolio value:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 