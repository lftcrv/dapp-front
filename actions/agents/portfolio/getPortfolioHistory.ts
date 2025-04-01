'use server';

import { PerformanceHistory, PerformanceHistoryParams } from '@/lib/types';

/**
 * Fetches portfolio history for a specific agent with optional filtering
 */
export async function getPortfolioHistory(
  agentId: string,
  params?: PerformanceHistoryParams
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
    const apiKey = process.env.API_KEY || 'secret';
    
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

    // Build query string
    const queryString = new URLSearchParams(queryParams).toString();
    
    const response = await fetch(`${apiUrl}/api/performance/${agentId}/history?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      next: { revalidate: 10 }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json() as PerformanceHistory;
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 