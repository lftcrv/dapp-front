import { useQuery } from '@tanstack/react-query';
import { Trade } from '@/lib/types';
import { tradeService } from '@/lib/services/api/trades';
import { useState, useMemo } from 'react';

interface UseTradesOptions {
  agentId?: string;
  initialData?: Trade[];
  limit?: number;
  enabled?: boolean;
}

export function useTrades({
  agentId,
  initialData,
  limit = 10,
  enabled = true,
}: UseTradesOptions = {}) {
  const [page, setPage] = useState(1);
  
  const queryKey = ['trades', agentId];

  const { data: allTrades, isLoading, error } = useQuery<Trade[], Error>({
    queryKey,
    queryFn: async () => {
      const result = agentId
        ? await tradeService.getByAgent(agentId)
        : await tradeService.getAll();

      if (!result.success) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Failed to fetch trades');
      }

      return result.data || [];
    },
    initialData,
    enabled: enabled && !initialData, // Only fetch if enabled and no initial data
    staleTime: 10000, // Consider data fresh for 10 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });

  // Memoize the paginated trades and hasMore
  const { paginatedTrades, hasMore } = useMemo(() => {
    const trades = allTrades || [];
    const slicedTrades = trades.slice(0, page * limit);
    return {
      paginatedTrades: slicedTrades,
      hasMore: slicedTrades.length < trades.length
    };
  }, [allTrades, page, limit]);

  const loadMore = () => setPage((p) => p + 1);

  return {
    trades: paginatedTrades,
    isLoading,
    error: error as Error | null,
    hasMore,
    loadMore,
  };
}
