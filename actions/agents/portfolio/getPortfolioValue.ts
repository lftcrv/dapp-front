'use server';

import { PnLResponse } from '@/lib/types';

/**
 * Fetches the current portfolio value and PnL information for a specific agent
 */
export async function getPortfolioValue(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
    const apiKey = process.env.API_KEY || 'secret';

    const response = await fetch(`${apiUrl}/api/kpi/pnl/${agentId}`, {
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

    const data = await response.json() as PnLResponse;
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error fetching portfolio value:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 