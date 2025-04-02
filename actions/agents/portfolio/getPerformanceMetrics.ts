'use server';

import {
  PerformanceMetrics,
  PerformanceHistory,
  PerformanceSnapshot,
} from '@/lib/types';

/**
 * Fetches the latest performance metrics for a specific agent
 * This uses either the direct metrics endpoint or falls back to getting the latest
 * from the history endpoint if the direct endpoint isn't implemented yet
 */
export async function getPerformanceMetrics(agentId: string) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
    const apiKey = process.env.API_KEY || 'secret';

    try {
      // First try the direct endpoint
      const response = await fetch(`${apiUrl}/api/performance/${agentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        next: { revalidate: 10 },
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = (await response.json()) as PerformanceMetrics;
      return {
        success: true,
        data,
      };
    } catch {
      console.log(
        'Direct metrics endpoint not available, falling back to history endpoint',
      );

      // If the direct endpoint fails, try to get the latest snapshot from history
      const historyResponse = await fetch(
        `${apiUrl}/api/performance/${agentId}/history?interval=hourly`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          next: { revalidate: 10 },
        },
      );

      if (!historyResponse.ok) {
        throw new Error(
          `History API request failed with status ${historyResponse.status}`,
        );
      }

      const historyData = (await historyResponse.json()) as PerformanceHistory;

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
