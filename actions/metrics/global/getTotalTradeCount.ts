'use server';

import { callApi } from '../api-utils';
import { TotalTradeCount } from '@/lib/types/metrics';

/**
 * Fetches the total number of trades across all agents
 */
export async function getTotalTradeCount() {
  try {
    const response = await callApi<TotalTradeCount>(
      '/api/metrics/global/trades',
      'GET'
    );

    return {
      success: true,
      data: response.totalTradeCount
    };
  } catch (error) {
    console.error('Error fetching total trade count:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 