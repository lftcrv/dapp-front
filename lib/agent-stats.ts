import { useState, useCallback } from 'react';

interface AgentStats {
  successRate: number;
  profitLoss: number;
  tradeCount: number;
  performanceScore: number;
}

export function useAgentStats(agentId: string) {
  const [data, setData] = useState<AgentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch stats from API
      const response = await fetch(`/api/agent/${agentId}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch agent stats');
      }
      const stats = await response.json();
      setData(stats.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStats
  };
} 