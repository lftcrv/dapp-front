'use server';

import { callApi } from './api-utils';

// Define the type for time range
export type TimeRange = '1W' | '1M' | '3M' | 'ALL';

// Define types for the API response
export interface SnapshotData {
  timestamp: string;
  balanceInUSD?: number;
  tradeCount?: number;
  [key: string]: unknown;
}

export interface PortfolioHistoryResponse {
  snapshots: SnapshotData[];
}

/**
 * Server action to fetch historical portfolio data for an agent
 */
export async function getPortfolioHistoricalData(
  agentId: string,
  timeRange: TimeRange
) {
  try {
    // Debug logs for troubleshooting API key issues
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;
    
    // Create date range based on selected time period
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '1W':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 8);
        break;
      case '1M':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'ALL':
      default:
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
    }

    const fromDate = startDate.toISOString();
    const toDate = now.toISOString();

    // Determine the interval based on time range
    const getInterval = (range: TimeRange) => {
      switch (range) {
        case '1W':
          return 'hourly'; // Get hourly data for week view
        case '1M':
          return 'daily'; // Daily for month view
        default:
          return 'daily'; // Daily for longer periods
      }
    };
    
    const interval = getInterval(timeRange);
    
    try {
      const result = await callApi<PortfolioHistoryResponse>(
        `/api/performance/${agentId}/history`,
        'GET',
        undefined,
        {
          interval,
          from: fromDate,
          to: toDate
        }
      );
      
      return {
        success: true,
        data: result,
        timeRange
      };
    } catch (apiError) {
      // Detailed API error logging
      throw apiError; // Re-throw to be caught by outer try/catch
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
} 