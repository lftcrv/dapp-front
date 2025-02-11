import { useQuery } from '@tanstack/react-query';
import { Agent, TokenMarketData } from '@/lib/types';
import { getLatestAgents } from '@/actions/agents/query/getLatestAgents';
import { getLeaderboardLeft } from '@/actions/agents/query/getLeaderboardLeft';
import { getLeaderboardRight } from '@/actions/agents/query/getLeaderboardRight';

interface AgentsData {
  latestAgents: Agent[];
  leftLeaderboard: Agent[];
  rightLeaderboard: Agent[];
  marketData: Record<string, TokenMarketData>;
}

export function useAgentsData() {
  return useQuery<AgentsData, Error>({
    queryKey: ['agents-data'],
    queryFn: async () => {
      // Fetch all data in parallel
      const [latestResponse, leftResponse, rightResponse] = await Promise.all([
        getLatestAgents(50),
        getLeaderboardLeft(5),
        getLeaderboardRight(5)
      ]);

      // Validate responses
      if (!latestResponse.success || !leftResponse.success || !rightResponse.success) {
        throw new Error('Failed to fetch agent data');
      }

      // Process market data
      const marketData: Record<string, TokenMarketData> = {};
      latestResponse.data?.forEach((agent: Agent) => {
        marketData[agent.id] = {
          price: agent.price.toString(),
          priceChange24h: 0,
          marketCap: agent.marketCap,
          bondingStatus: agent.status === 'bonding' ? 'BONDING' : 'LIVE',
          holders: agent.holders
        };
      });

      return {
        latestAgents: latestResponse.data || [],
        leftLeaderboard: leftResponse.data || [],
        rightLeaderboard: rightResponse.data || [],
        marketData
      };
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
} 