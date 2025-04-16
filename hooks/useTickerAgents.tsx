'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAgents } from '@/actions/agents/query/getAgents';
import { getLatestAgents } from '@/actions/agents/query/getLatestAgents';
import { getTopPerformingAgent } from '@/actions/agents/query/getTopPerformingAgent';
import { Agent } from '@/lib/types';
import { isPnLPositive } from '@/lib/utils';
import { ArrowDown, ArrowUp, DollarSign, Minus, Zap, Trophy, Star, Rocket, Sparkles } from 'lucide-react';

export interface TickerItem {
  id: string;
  content: React.ReactNode;
}

// Helper function to format percentages with precision control
function formatPercentage(value: number, precision: number = 2): string {
  if (Math.abs(value) < 0.005) {
    return '0.00%';
  }
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
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${Math.abs(value).toFixed(0)}`;
}

// Get relative time string (e.g. "2h ago", "just now")
function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 5) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Check if date is within last 48 hours
function isWithin48Hours(date: Date): boolean {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours < 48;
}

// Fun easter egg messages that appear randomly
const easterEggs = [
  { id: 'egg-1', content: "🔮 Rumor has it Satoshi is trading here incognito" },
  { id: 'egg-2', content: "🚀 To the moon! (Not financial advice)" },
  { id: 'egg-3', content: "🧠 AI agents > human traders, change my mind" },
  { id: 'egg-4', content: "🦊 Forks are for eating, not for blockchains" },
  { id: 'egg-5', content: "💎 Diamond hands activated" },
  { id: 'egg-6', content: "🐻 Bears in shambles" },
  { id: 'egg-7', content: "🐂 Bulls on parade" },
  { id: 'egg-8', content: "⚡ Lightning fast, literally" },
  { id: 'egg-9', content: "🤖 I, for one, welcome our new agent overlords" },
  { id: 'egg-10', content: "👀 Ser, when airdrop?" }
];

// Dynamic phrase and emoji variants
const newAgentPhrases = [
  { icon: <Rocket className="w-3.5 h-3.5 text-purple-500 drop-shadow" aria-label="New agent" />, text: 'just launched' },
  { icon: <Star className="w-3.5 h-3.5 text-yellow-500 drop-shadow" aria-label="New agent" />, text: 'joined the party' },
  { icon: <Zap className="w-3.5 h-3.5 text-blue-500 drop-shadow animate-pulse" aria-label="New agent" />, text: 'zapped in' },
  { icon: <Sparkles className="w-3.5 h-3.5 text-pink-500 drop-shadow animate-bounce" aria-label="New agent" />, text: 'sparkled in' },
];
const pnlPhrases = [
  { text: 'earned', emoji: '💰', context: 'in 24h' },
  { text: 'cashed in', emoji: '🤑', context: 'this cycle' },
  { text: 'moonwalked', emoji: '🌙', context: 'in 24h' },
  { text: 'performed', emoji: '⚡', context: 'in 24h' },
];
const tvlPhrases = [
  { text: 'holds', emoji: '🤲' },
  { text: 'manages', emoji: '🧑‍💼' },
  { text: 'controls', emoji: '🎮' },
  { text: 'vaulted', emoji: '🏦' },
];

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
      const usedAgentIds = new Set<string>();
      
      // Create ticker items for latest agents (only those created within last 48h)
      if (latestAgents && latestAgents.length > 0) {
        latestAgents
          .filter(agent => agent.createdAt && isWithin48Hours(new Date(agent.createdAt)))
          .slice(0, 3)
          .forEach((agent, index) => {
            if (usedAgentIds.has(agent.id)) return;
            usedAgentIds.add(agent.id);
            const phrase = newAgentPhrases[index % newAgentPhrases.length];
            const timeAgo = agent.createdAt ? getRelativeTimeString(new Date(agent.createdAt)) : 'recently';
            
            tickerItems.push({
              id: `latest-${agent.id}-${index}`,
              content: (
                <div className="flex items-center font-patrick text-sm gap-1.5 drop-shadow">
                  {phrase.icon}
                  <span className="font-bold text-black/90">{agent.name}</span>
                  <span className="bg-gradient-to-r from-green-200 to-green-400 text-green-900 text-xs font-bold rounded px-2 py-0.5 ml-1 animate-bounce shadow" title="New agent">NEW</span>
                  <span className="text-gray-600">{phrase.text} {timeAgo}</span>
                </div>
              )
            });
          });
      }
      
      // Only include the top agent once to avoid duplicate information
      if (topAgent && !usedAgentIds.has(topAgent.id)) {
        const pnlValue = topAgent.pnlCycle || 0;
        if (Math.abs(pnlValue) >= 0.005) {
          usedAgentIds.add(topAgent.id);
          const pnlStatus = getPnLStatus(pnlValue);
          
          tickerItems.push({
            id: `top-${topAgent.id}`,
            content: (
              <div className="flex items-center font-patrick text-sm gap-1.5 drop-shadow">
                <span className="text-lg">🏆</span>
                <span className="font-bold text-black/90">{topAgent.name}</span>
                <span className="text-gray-600">leads the cycle</span>
                <span className={`font-bold px-2 py-0.5 rounded-full shadow-lg ${
                  pnlStatus === 'positive' ? 'bg-green-100 text-green-700' : 
                  pnlStatus === 'negative' ? 'bg-red-100 text-red-700' : 
                  'bg-gray-200 text-gray-700'
                } flex items-center gap-0.5 ml-1`} aria-label="PnL">
                  {pnlStatus === 'positive' ? <ArrowUp className="w-3 h-3" aria-label="Up" /> : 
                   pnlStatus === 'negative' ? <ArrowDown className="w-3 h-3" aria-label="Down" /> : 
                   <Minus className="w-3 h-3" aria-label="No change" />}
                  {formatPercentage(pnlValue)}
                  <span className="ml-1 text-xs">this cycle</span>
                  {Math.abs(pnlValue) > 20 && <span className="ml-1 animate-pulse">🔥</span>}
                </span>
              </div>
            )
          });
        }
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
        if (usedAgentIds.has(agent.id)) return;
        usedAgentIds.add(agent.id);
        const pnlValue = agent.pnl24h || 0;
        const pnlStatus = getPnLStatus(pnlValue);
        const phrase = pnlPhrases[index % pnlPhrases.length];
        
        const isVeryHighPnl = Math.abs(pnlValue) > 20; // Highlight exceptional performance
        
        tickerItems.push({
          id: `pnl24h-${agent.id}-${index}`,
          content: (
            <div className="flex items-center font-patrick text-sm gap-1.5 drop-shadow">
              <span className="text-lg">{phrase.emoji}</span>
              <span className="font-bold text-black/90">{agent.name}</span>
              <span className="text-gray-600" title="24h profit & loss (PnL)">{phrase.text}</span>
              <span className={`font-bold px-2 py-0.5 rounded-full shadow-lg ${
                pnlStatus === 'positive' ? 'bg-green-100 text-green-700' : 
                pnlStatus === 'negative' ? 'bg-red-100 text-red-700' : 
                'bg-gray-200 text-gray-700'
              } flex items-center gap-0.5 ml-1`} aria-label="PnL">
                {pnlStatus === 'positive' ? <ArrowUp className="w-3 h-3" aria-label="Up" /> : 
                 pnlStatus === 'negative' ? <ArrowDown className="w-3 h-3" aria-label="Down" /> : 
                 <Minus className="w-3 h-3" aria-label="No change" />}
                {formatPercentage(pnlValue)}
                <span className="ml-1 text-xs">{phrase.context}</span>
                {isVeryHighPnl && <span className="ml-1 animate-pulse">🔥</span>}
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
        if (usedAgentIds.has(agent.id)) return;
        usedAgentIds.add(agent.id);
        const phrase = tvlPhrases[index % tvlPhrases.length];
        const isWhale = (agent.tvl || 0) > 1000000; // Highlight whales (>$1M TVL)
        
        tickerItems.push({
          id: `tvl-${agent.id}-${index}`,
          content: (
            <div className="flex items-center font-patrick text-sm gap-1.5 drop-shadow">
              <span className="text-lg">{phrase.emoji}</span>
              <span className="font-bold text-black/90">{agent.name}</span>
              <span className="text-gray-600" title="Total Value Locked (TVL)">{phrase.text}</span>
              <span className="font-bold text-gray-800 px-2 py-0.5 rounded-full bg-yellow-100 shadow-inner ml-1">{formatDollarValue(agent.tvl || 0)}</span>
              {isWhale && <span className="text-blue-500 text-xs ml-1 animate-bounce" title="Whale agent">🐋</span>}
            </div>
          )
        });
      });
      
      // Add random easter eggs (10% chance)
      if (tickerItems.length < 8 && Math.random() < 0.10) {
        const randomEgg = easterEggs[Math.floor(Math.random() * easterEggs.length)];
        tickerItems.push({
          id: `egg-${Date.now()}`,
          content: (
            <div className="flex items-center font-patrick text-sm gap-1.5 bg-yellow-100/30 px-1 py-0.5 rounded-sm drop-shadow">
              {randomEgg.content}
            </div>
          )
        });
      }
      
      // Limit ticker items to 8 for clarity
      const shuffledItems = [...tickerItems].sort(() => Math.random() - 0.5).slice(0, 8);
      
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
            <div className="flex items-center font-patrick text-sm gap-1.5 drop-shadow">
              <span className="text-lg">👋</span>
              <span className="font-bold text-black/90">Welcome to the Trading Agents Arena</span>
            </div>
          ),
        },
        {
          id: 'fallback-2',
          content: (
            <div className="flex items-center font-patrick text-sm gap-1.5 drop-shadow">
              <span className="text-lg">🤖</span>
              <span className="font-bold text-black/90">Create, train and deploy your own agents</span>
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