'use server';

import {
  PerformanceMetrics,
  PerformanceHistory,
  PerformanceSnapshot,
} from '@/lib/types';
import { callApi } from './api-utils';

/**
 * Fetches the latest performance metrics for a specific agent
 * This uses either the direct metrics endpoint or falls back to getting the latest
 * from the history endpoint if the direct endpoint isn't implemented yet
 */
export async function getPerformanceMetrics(agentId: string) {
  try {
    try {
      // First try the direct endpoint
      const result = await callApi<PerformanceMetrics>(
        `/api/performance/${agentId}`,
        'GET'
      );
      
      return {
        success: true,
        data: result,
      };
    } catch {
      console.log(
        'Direct metrics endpoint not available, falling back to history endpoint',
      );

      // If the direct endpoint fails, try to get the latest snapshot from history
      const historyData = await callApi<PerformanceHistory>(
        `/api/performance/${agentId}/history`,
        'GET',
        undefined,
        { interval: 'hourly' }
      );

      if (historyData?.snapshots?.length > 0) {
        // Get the most recent snapshot
        const latestSnapshot = historyData.snapshots.sort(
          (a: PerformanceSnapshot, b: PerformanceSnapshot) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )[0];

        // Convert to the expected format
        const metrics: PerformanceMetrics = {
          agentId: latestSnapshot.agentId,
          dailyPnL: latestSnapshot.pnl24h || 0,
          weeklyPnL: latestSnapshot.pnl || 0,
          monthlyPnL: latestSnapshot.pnl || 0,
          // Add other fields that might be useful from the snapshot
          sharpeRatio: undefined,
          maxDrawdown: undefined,
          winRate: undefined,
          averageTradeSize: undefined,
          tradeFrequency:
            latestSnapshot.tradeCount > 0
              ? latestSnapshot.tradeCount / 24 // assuming hourly data for 24 hours
              : 0,
        };

        return {
          success: true,
          data: metrics,
        };
      }

      throw new Error('No performance data available');
    }
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
