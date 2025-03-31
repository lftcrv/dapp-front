'use server';

import { callApi } from '../api-utils';
import { TotalTVL } from '@/lib/types/metrics';

/**
 * Fetches the total value locked (TVL) across all agents
 */
export async function getTotalTVL() {
  try {
    const response = await callApi<TotalTVL>(
      '/api/metrics/global/tvl',
      'GET'
    );

    return {
      success: true,
      data: response.totalTVL
    };
  } catch (error) {
    console.error('Error fetching total TVL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 