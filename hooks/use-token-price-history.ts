import { useCallback, useEffect, useState } from 'react';
import { getTokenPriceHistory } from '@/actions/agents/token/getTokenInfo';

interface PriceHistoryData {
  prices: {
    id: string;
    price: string;
    timestamp: string;
  }[];
  tokenSymbol: string;
  tokenAddress: string;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function useTokenPriceHistory(agentId: string) {
  const [data, setData] = useState<CandleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPriceHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getTokenPriceHistory(agentId);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch price history');
      }

      // Transform API data to CandleData format
      const candleData: CandleData[] = response.data.prices.map((price) => {
        const timestamp = Math.floor(new Date(price.timestamp).getTime() / 1000);
        const priceValue = parseFloat(price.price);
        
        return {
          time: timestamp,
          open: priceValue,
          high: priceValue,
          low: priceValue,
          close: priceValue,
          volume: 0, // We don't have volume data from the API
        };
      }).sort((a, b) => a.time - b.time); // Sort by timestamp ascending

      setData(candleData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch price history'));
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchPriceHistory();
    
    // Refresh every minute
    const interval = setInterval(fetchPriceHistory, 60000);
    return () => clearInterval(interval);
  }, [fetchPriceHistory]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchPriceHistory
  };
} 