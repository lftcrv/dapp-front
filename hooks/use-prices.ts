import { useCallback, useEffect, useState } from 'react';
import {
  getTokenPriceHistory,
  getCurrentPrice,
} from '@/actions/agents/token/getTokenInfo';

interface PriceData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface UsePricesOptions {
  symbol: string;
  agentId: string;
}

// Helper function to convert wei string to ETH number with proper precision
function formatEthPrice(priceInWei: string): number {
  try {
    // Use BigInt to handle large numbers precisely
    const wei = BigInt(priceInWei);
    // Convert to string with 18 decimal places to avoid scientific notation
    const ethString = (Number(wei) / 1e18).toFixed(18);
    // Convert back to number for the chart
    const priceInEth = parseFloat(ethString);

    // Validate the result
    if (isNaN(priceInEth) || !isFinite(priceInEth)) {
      console.warn('[formatEthPrice] Invalid price value:', priceInWei);
      return 0;
    }

    return priceInEth;
  } catch (err) {
    console.error('[formatEthPrice] Error parsing price:', err);
    return 0;
  }
}

export function usePrices({ symbol, agentId }: UsePricesOptions) {
  const [data, setData] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch both price history and current price in parallel
      const [historyResponse, currentPriceResponse] = await Promise.all([
        getTokenPriceHistory(agentId),
        getCurrentPrice(agentId),
      ]);

      if (!historyResponse.success) {
        throw new Error(
          historyResponse.error || 'Failed to fetch price history',
        );
      }

      if (!historyResponse.data || !historyResponse.data.prices) {
        throw new Error('Invalid price history data format');
      }

      // Create a map to handle duplicate timestamps
      const priceMap = new Map<number, PriceData>();

      // Process historical data
      historyResponse.data.prices.forEach((price) => {
        const timestamp = Math.floor(
          new Date(price.timestamp).getTime() / 1000,
        );
        const priceValue = formatEthPrice(price.price);

        // If we have a duplicate timestamp, keep the latest price
        const existing = priceMap.get(timestamp);
        if (!existing) {
          priceMap.set(timestamp, {
            time: timestamp,
            open: priceValue,
            high: priceValue,
            low: priceValue,
            close: priceValue,
            volume: 0,
          });
        }
      });

      // Add current price if available
      if (currentPriceResponse.success && currentPriceResponse.data) {
        const currentPrice = formatEthPrice(currentPriceResponse.data);

        if (currentPrice > 0) {
          const now = Math.floor(Date.now() / 1000);

          // Ensure current price has a unique timestamp
          let currentTimestamp = now;
          while (priceMap.has(currentTimestamp)) {
            currentTimestamp += 1; // Add 1 second if timestamp exists
          }

          priceMap.set(currentTimestamp, {
            time: currentTimestamp,
            open: currentPrice,
            high: currentPrice,
            low: currentPrice,
            close: currentPrice,
            volume: 0,
          });
        }
      }

      // Convert map to array and sort by timestamp
      const priceData = Array.from(priceMap.values()).sort(
        (a, b) => a.time - b.time,
      ); // Ensure ascending order

      setData(priceData);
      setError(null);
    } catch (err) {
      console.error('[usePrices] Error:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to fetch prices'),
      );
      setData([]); // Reset data on error
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchPrices();

    // Refresh every minute
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return {
    prices: data,
    isLoading,
    error,
    refetch: fetchPrices,
  };
}
