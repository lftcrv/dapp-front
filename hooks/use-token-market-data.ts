'use client';

import { TokenMarketData } from '@/lib/types';
import { getTokenMarketData } from '@/actions/agents/token/getTokenInfo';
import { useEffect, useState } from 'react';

export function useTokenMarketData(agentId: string) {
  const [data, setData] = useState<TokenMarketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const result = await getTokenMarketData(agentId);
        if (!mounted) return;

        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch market data');
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    // Set up polling every minute to match the API update frequency
    const interval = setInterval(fetchData, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [agentId]);

  return { data, error, isLoading };
} 