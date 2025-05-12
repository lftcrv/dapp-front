'use server';

import { callApi } from './api-utils';

/**
 * Server action to fetch the latest portfolio values for an agent
 */
export interface PortfolioLatestValues {
  latestBalance?: number;
  pnl?: number;
  pnl24h?: number;
  pnlPercentage?: number;
}

export async function getPortfolioLatestValues(agentId: string) {
  try {
    // Use the same endpoint as in portfolio-chart.tsx
    const result = await callApi<PortfolioLatestValues>(`/api/kpi/pnl/${agentId}`, 'GET');
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error fetching portfolio latest values:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
} 