'use server';

import { GlobalMetrics } from '@/lib/types/metrics';
import { getTotalAgentCount } from './getTotalAgentCount';
import { getTotalTradeCount } from './getTotalTradeCount';
import { getTotalTVL } from './getTotalTVL';
import { getTotalBalance } from './getTotalBalance';

/**
 * Fetches all global metrics in a single call
 * This combines multiple API calls for convenience in the UI
 */
export async function getAllGlobalMetrics() {
  try {
    // Make all API calls in parallel
    const [
      agentCountResult, 
      tradeCountResult, 
      tvlResult, 
      balanceResult
    ] = await Promise.all([
      getTotalAgentCount(),
      getTotalTradeCount(),
      getTotalTVL(),
      getTotalBalance()
    ]);

    // Check if any of the requests failed
    if (!agentCountResult.success || !tradeCountResult.success || 
        !tvlResult.success || !balanceResult.success) {
      // Collect any error messages
      const errors = [
        agentCountResult.success ? null : agentCountResult.error,
        tradeCountResult.success ? null : tradeCountResult.error,
        tvlResult.success ? null : tvlResult.error,
        balanceResult.success ? null : balanceResult.error,
      ].filter(Boolean);

      throw new Error(`Failed to fetch some metrics: ${errors.join(', ')}`);
    }

    // Combine all metrics into a single object
    const metrics: GlobalMetrics = {
      totalAgentCount: agentCountResult.data || 0,
      totalTradeCount: tradeCountResult.data || 0,
      totalTVL: tvlResult.data || 0,
      totalBalance: balanceResult.data || 0
    };

    return {
      success: true,
      data: metrics
    };
  } catch (error) {
    console.error('Error fetching all global metrics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 