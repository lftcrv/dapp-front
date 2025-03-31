'use server';

import { callApi } from '../api-utils';
import { TotalBalance } from '@/lib/types/metrics';

/**
 * Fetches the total balance across all agents
 */
export async function getTotalBalance() {
  try {
    const response = await callApi<TotalBalance>(
      '/api/metrics/global/balances',
      'GET'
    );

    return {
      success: true,
      data: response.totalBalance
    };
  } catch (error) {
    console.error('Error fetching total balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 