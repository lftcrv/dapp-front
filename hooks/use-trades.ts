import { useState, useEffect } from 'react';
import { Trade } from '@/lib/types';
import { tradeService } from '@/lib/services/api/trades';
import { useAsyncState } from '@/lib/core/state';

interface UseTradesOptions {
  agentId?: string;
  initialData?: Trade[];
  limit?: number;
}

export function useTrades({
  agentId,
  initialData,
  limit = 10,
}: UseTradesOptions = {}) {
  const state = useAsyncState<Trade[]>(initialData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);

  useEffect(() => {
    async function fetchTrades() {
      if (initialData) return;

      state.setLoading(true);
      const result = agentId
        ? await tradeService.getByAgent(agentId)
        : await tradeService.getAll();

      if (result.success && result.data) {
        setAllTrades(result.data);
        const paginatedTrades = result.data.slice(0, page * limit);
        state.setData(paginatedTrades);
        setHasMore(paginatedTrades.length < result.data.length);
      } else if (result.error) {
        state.setError(result.error);
      }
    }

    fetchTrades();
  }, [agentId, page, limit, initialData]);

  const loadMore = () => setPage((p) => p + 1);

  return {
    trades: state.data || [],
    isLoading: state.isLoading,
    error: state.error,
    hasMore,
    loadMore,
  };
}
