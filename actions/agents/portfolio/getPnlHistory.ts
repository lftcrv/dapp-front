'use server';

import { callApi } from './api-utils';

/**
 * Server action to fetch the P&L history data for an agent
 * This keeps the API key secure by only using it server-side
 */
export async function getPnlHistory(
  agentId: string,
  range: string = '7d' // default to 7 days
) {
  try {
    // Convert time range to dates
    const now = new Date();
    let startDate;

    switch (range.toLowerCase()) {
      case '1w':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'all':
      default:
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
    }

    const fromDate = startDate.toISOString();
    const toDate = now.toISOString();

    const result = await callApi(
      `/api/performance/${agentId}/history`,
      'GET',
      undefined,
      {
        interval: 'daily',
        from: fromDate,
        to: toDate
      }
    );
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error fetching PnL history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
} 