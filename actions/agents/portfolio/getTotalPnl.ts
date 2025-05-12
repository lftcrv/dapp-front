'use server';

import { callApi } from './api-utils';

/**
 * Server action to fetch the total P&L data for an agent
 * This keeps the API key secure by only using it server-side
 */
export async function getTotalPnl(agentId: string) {
  try {
    const result = await callApi(`/api/kpi/pnl/${agentId}`, 'GET');
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error fetching PnL data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
} 