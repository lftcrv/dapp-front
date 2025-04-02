'use server';

import { callApi } from '../api-utils';
import { TotalAgentCount } from '@/lib/types/metrics';

/**
 * Fetches the total number of agents in the system
 */
export async function getTotalAgentCount() {
  try {
    const response = await callApi<TotalAgentCount>(
      '/api/metrics/global/agent-count',
      'GET'
    );

    return {
      success: true,
      data: response.totalAgentCount
    };
  } catch (error) {
    console.error('Error fetching total agent count:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 