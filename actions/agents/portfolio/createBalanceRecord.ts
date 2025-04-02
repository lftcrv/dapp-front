'use server';

import { callApi } from './api-utils';
import { BalanceRecord } from '@/lib/types/portfolio';

interface CreateBalanceParams {
  runtimeAgentId: string;
  balanceInUSD: number;
}

/**
 * Creates a new balance record for an agent
 * This is typically used by the agent itself to report its current balance
 * Note: This endpoint may not be implemented yet on the backend
 */
export async function createBalanceRecord({
  runtimeAgentId,
  balanceInUSD
}: CreateBalanceParams) {
  try {
    console.log(`Creating balance record for agent ${runtimeAgentId} with balance ${balanceInUSD}`);
    
    const response = await callApi<BalanceRecord>(
      '/api/kpi/balance',
      'POST',
      {
        runtimeAgentId,
        balanceInUSD
      }
    );

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error creating balance record:', error);
    
    // If the endpoint is not found (404), provide a more helpful message
    if (error instanceof Error && error.message.includes('not found')) {
      return {
        success: false,
        error: 'The balance creation endpoint is not implemented yet on the backend',
        details: error.message
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 