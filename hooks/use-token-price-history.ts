import { useCallback, useEffect, useState } from 'react';
import { getTokenPriceHistory } from '@/actions/agents/token/getTokenInfo';
import { PriceData } from '@/lib/types';

export function useTokenPriceHistory(agentId: string) {
  const [data, setData] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPriceHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getTokenPriceHistory(agentId);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch price history');
      }

      // Transform API data to PriceData format
      const priceData: PriceData[] = response.data.prices.map((price) => {
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

      setData(priceData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch price history'));
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchPriceHistory();
  }, [fetchPriceHistory]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchPriceHistory
  };
} 