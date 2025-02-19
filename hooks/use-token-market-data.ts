'use client';

import { useCallback, useEffect, useState } from 'react';
import { TokenMarketData, Agent } from '@/lib/types';
import { getLatestAgents } from '@/actions/agents/query/getLatestAgents';

// Create a cache to store the latest market data
let marketDataCache: Record<string, TokenMarketData> = {};
let lastFetchTimestamp = 0;
const CACHE_DURATION = 60000; // 1 minute cache

export function useTokenMarketData(agentId: string) {
  const [data, setData] = useState<TokenMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if we have fresh cached data
      const now = Date.now();
      if (now - lastFetchTimestamp < CACHE_DURATION && marketDataCache[agentId]) {
        setData(marketDataCache[agentId]);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Fetch latest agents data
      const response = await getLatestAgents(); // Fetch enough agents to likely include the one we need

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch market data');
      }

      // Update cache with all agents' market data
      marketDataCache = {};
      lastFetchTimestamp = now;

      response.data.forEach((agent: Agent) => {
        marketDataCache[agent.id] = {
          price: agent.price.toString(),
          priceChange24h: 0, // We don't have this in Agent type yet
          marketCap: agent.marketCap,
          bondingStatus: agent.status === 'bonding' ? 'BONDING' : 'LIVE',
          holders: agent.holders
        };
      });

      // Set data for the requested agent
      if (marketDataCache[agentId]) {
        setData(marketDataCache[agentId]);
        setError(null);
      } else {
        setData(null);
        setError(new Error('Agent not found in latest data'));
      }
    } catch (err) {
      console.error('[useTokenMarketData] Error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch market data'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMarketData
  };
} 