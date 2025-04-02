'use server';

import { callApi } from './api-utils';
import { PerformanceHistory, PerformanceHistoryParams } from '@/lib/types/portfolio';

/**
 * Fetches portfolio history for a specific agent with optional filtering
 */
export async function getPortfolioHistory(
  agentId: string,
  params?: PerformanceHistoryParams
) {
  try {
    // Default to hourly if not specified
    const interval = params?.interval || 'hourly';
    
    // Build query parameters
    const queryParams: Record<string, string> = { 
      interval 
    };
    
    if (params?.from) {
      queryParams.from = params.from;
    }
    
    if (params?.to) {
      queryParams.to = params.to;
    }

    const response = await callApi<PerformanceHistory>(
      `/api/performance/${agentId}/history`,
      'GET',
      undefined,
      queryParams
    );

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 