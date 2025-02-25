import { useQuery } from '@tanstack/react-query';
import { Trade } from '@/lib/types';
import { tradeService } from '@/lib/services/api/trades';
import { useState, useMemo } from 'react';

interface UseTradesOptions {
  agentId?: string;
  initialData?: Trade[];
  limit?: number;
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useTrades({
  agentId,
  initialData,
  limit = 10,
  enabled = true,
  refetchInterval = false,
}: UseTradesOptions = {}) {
  const [page, setPage] = useState(1);

  // More specific query key to allow proper caching per agent
  const queryKey = agentId ? ['trades', 'agent', agentId] : ['trades', 'all'];

  const {
    data: allTrades,
    isLoading,
    error,
    refetch,
  } = useQuery<Trade[], Error>({
    queryKey,
    queryFn: async () => {
      const result = agentId
        ? await tradeService.getByAgent(agentId)
        : await tradeService.getAll();

      if (!result.success) {
        throw new Error(
          typeof result.error === 'string'
            ? result.error
            : 'Failed to fetch trades',
        );
      }

      return result.data || [];
    },
    initialData,
    // Always enable the query if agentId is present, but respect the enabled flag
    enabled: enabled && agentId !== undefined,
    // Cache the data for 10 seconds before considering it stale
    staleTime: 10000,
    // Keep in cache for 1 minute
    gcTime: 60000,
    // Allow periodic refetching if specified
    refetchInterval,
    // Refetch on window focus
    refetchOnWindowFocus: true,
  });

  // Memoize the paginated trades and hasMore
  const { paginatedTrades, hasMore } = useMemo(() => {
    const trades = allTrades || [];
    const slicedTrades = trades.slice(0, page * limit);
    return {
      paginatedTrades: slicedTrades,
      hasMore: slicedTrades.length < trades.length,
    };
  }, [allTrades, page, limit]);

  const loadMore = () => setPage((p) => p + 1);

  // Add a reset function to go back to page 1
  const resetPagination = () => setPage(1);

  // Add a manual refresh function
  const refreshTrades = () => refetch();

  return {
    trades: paginatedTrades,
    isLoading,
    error: error as Error | null,
    hasMore,
    loadMore,
    resetPagination,
    refreshTrades,
    totalTradesCount: allTrades?.length || 0,
  };
}
