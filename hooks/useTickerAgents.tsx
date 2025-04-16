'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAgents } from '@/actions/agents/query/getAgents';
import { getLatestAgents } from '@/actions/agents/query/getLatestAgents';
import { getTopPerformingAgent } from '@/actions/agents/query/getTopPerformingAgent';
import { Agent } from '@/lib/types';
import { isPnLPositive } from '@/lib/utils';
import { ArrowDown, ArrowUp, Circle, DollarSign, Minus } from 'lucide-react';

export interface TickerItem {
  id: string;
  content: React.ReactNode;
}

// Helper function to format percentages with precision control
function formatPercentage(value: number, precision: number = 2): string {
  // Handle zero or very small changes
  if (Math.abs(value) < 0.005) {
    return '0.00%';
  }
  
  // Handle edge case where value is small but significant
  if (Math.abs(value) < 0.01 && value !== 0) {
    return value > 0 ? '<+0.01%' : '<-0.01%';
  }
  
  const formatted = value.toFixed(precision);
  return `${value >= 0 ? '+' : ''}${formatted}%`;
}

// Helper function to determine PnL status: positive, negative, or neutral
function getPnLStatus(value: number): 'positive' | 'negative' | 'neutral' {
  if (Math.abs(value) < 0.005) return 'neutral';
  return value >= 0 ? 'positive' : 'negative';
}

// Helper function to format dollar values
function formatDollarValue(value: number): string {
  // For values >= 1 million, show as 1.2M
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  
  // For values >= 1 thousand, show as 1.2K
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  
  // For smaller values, show as $123
  return `$${Math.abs(value).toFixed(0)}`;
}

export function useTickerAgents() {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickerData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get all agents
      const allAgentsResponse = await getAgents();
      
      // Get latest created agents
      const latestAgentsResponse = await getLatestAgents();
      
      // Get top performing agent
      const topAgentResponse = await getTopPerformingAgent();
      
      if (!allAgentsResponse.success) {
        throw new Error(allAgentsResponse.error || 'Failed to fetch agents');
      }
      
      const allAgents = allAgentsResponse.data;
      const latestAgents = latestAgentsResponse.success ? latestAgentsResponse.data : [];
      const topAgent = topAgentResponse.success ? topAgentResponse.data : null;
      
      // Create array to hold our ticker items
      const tickerItems: TickerItem[] = [];
      
      // Create ticker items for latest agents
      if (latestAgents && latestAgents.length > 0) {
        latestAgents.slice(0, 3).forEach((agent, index) => {
          tickerItems.push({
            id: `latest-${agent.id}-${index}`,
            content: (
              <div className="flex items-center font-patrick text-sm gap-1.5">
                <Circle className="w-2 h-2 fill-purple-500 text-purple-500" />
                <span className="font-medium">{agent.name}</span> 
                <span className="text-gray-600">launched new agent</span>
              </div>
            )
          });
        });
      }
      
      // Only include the top agent once to avoid duplicate information
      if (topAgent) {
        const pnlValue = topAgent.pnlCycle || 0;
        const pnlStatus = getPnLStatus(pnlValue);
        
        tickerItems.push({
          id: `top-${topAgent.id}`,
          content: (
            <div className="flex items-center font-patrick text-sm gap-1.5">
              <Circle className="w-2 h-2 fill-orange-500 text-orange-500" />
              <span className="font-medium">{topAgent.name}</span>
              <DollarSign className="w-3 h-3 text-gray-600" /> 
              <span className={`font-bold ${
                pnlStatus === 'positive' ? 'text-green-500' : 
                pnlStatus === 'negative' ? 'text-red-500' : 
                'text-gray-500'
              } flex items-center gap-0.5`}>
                {pnlStatus === 'positive' ? <ArrowUp className="w-3 h-3" /> : 
                 pnlStatus === 'negative' ? <ArrowDown className="w-3 h-3" /> : 
                 <Minus className="w-3 h-3" />}
                {formatPercentage(pnlValue)}
              </span>
            </div>
          )
        });
      }
      
      // Sort all agents by PnL 24h (descending)
      const bestPnl24hAgents: Agent[] = allAgents && Array.isArray(allAgents) 
        ? allAgents
            .filter(agent => agent.pnl24h !== undefined && agent.pnl24h !== null)
            .sort((a, b) => (b.pnl24h || 0) - (a.pnl24h || 0))
            .slice(0, 3)
        : [];
      
      // Create ticker items for best PnL 24h agents
      bestPnl24hAgents.forEach((agent, index) => {
        const pnlValue = agent.pnl24h || 0;
        const pnlStatus = getPnLStatus(pnlValue);
        
        tickerItems.push({
          id: `pnl24h-${agent.id}-${index}`,
          content: (
            <div className="flex items-center font-patrick text-sm gap-1.5">
              <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
              <span className="font-medium">{agent.name}</span>
              <span className="text-gray-600">24h</span>
              <span className={`font-bold ${
                pnlStatus === 'positive' ? 'text-green-500' : 
                pnlStatus === 'negative' ? 'text-red-500' : 
                'text-gray-500'
              } flex items-center gap-0.5`}>
                {pnlStatus === 'positive' ? <ArrowUp className="w-3 h-3" /> : 
                 pnlStatus === 'negative' ? <ArrowDown className="w-3 h-3" /> : 
                 <Minus className="w-3 h-3" />}
                {formatPercentage(pnlValue)}
              </span>
            </div>
          )
        });
      });
      
      // Sort all agents by TVL (descending)
      const highestTvlAgents: Agent[] = allAgents && Array.isArray(allAgents)
        ? allAgents
            .filter(agent => agent.tvl && agent.tvl > 0)
            .sort((a, b) => (b.tvl || 0) - (a.tvl || 0))
            .slice(0, 3)
        : [];
      
      // Create ticker items for highest TVL agents
      highestTvlAgents.forEach((agent, index) => {
        tickerItems.push({
          id: `tvl-${agent.id}-${index}`,
          content: (
            <div className="flex items-center font-patrick text-sm gap-1.5">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" /> 
              <span className="font-medium">{agent.name}</span>
              <span className="text-gray-600">TVL</span>
              <span className="font-bold text-gray-800">{formatDollarValue(agent.tvl || 0)}</span>
            </div>
          )
        });
      });
      
      // Shuffle the array to mix up different types of data
      const shuffledItems = [...tickerItems].sort(() => Math.random() - 0.5);
      
      setTickerItems(shuffledItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching ticker data:', err);
      setError('Failed to load ticker data');
      // Provide some fallback items in case of error
      setTickerItems([
        {
          id: 'fallback-1',
          content: (
            <div className="flex items-center font-patrick text-sm gap-1.5">
              <Circle className="w-2 h-2 fill-orange-500 text-orange-500" />
              <span className="font-medium">Welcome to the Trading Agents Arena</span>
            </div>
          ),
        },
        {
          id: 'fallback-2',
          content: (
            <div className="flex items-center font-patrick text-sm gap-1.5">
              <Circle className="w-2 h-2 fill-purple-500 text-purple-500" />
              <span className="font-medium">Create, train and deploy your own agents</span>
            </div>
          ),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchTickerData();
    
    // Set up polling for real-time updates
    const intervalId = setInterval(fetchTickerData, 60000); // Refresh every minute
    return () => clearInterval(intervalId);
  }, [fetchTickerData]);
  
  return {
    tickerItems,
    isLoading,
    error,
    refreshTickerData: fetchTickerData
  };
} 