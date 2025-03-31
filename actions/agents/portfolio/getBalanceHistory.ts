'use server';

import { callApi } from './api-utils';

export interface BalanceHistoryItem {
  id: string;
  balanceInUSD: number;
  createdAt: string;
}

export interface BalanceHistory {
  agentId: string;
  balances: BalanceHistoryItem[];
}

/**
 * Fetches the balance history for a specific agent
 */
export async function getBalanceHistory(agentId: string) {
  try {
    const response = await callApi<BalanceHistory>(
      `/api/kpi/balance/${agentId}`,
      'GET'
    );

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error fetching balance history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 