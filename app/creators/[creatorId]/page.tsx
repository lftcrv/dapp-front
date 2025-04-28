'use client';

import React, { useState, useEffect, use } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Agent, Performance, AgentType, AgentStatus, CharacterConfig } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, BarChart, GitFork, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Mock Creator Detail Type
interface CreatorDetail {
  id: string;
  name: string;
  avatarUrl?: string;
  totalPnl: number;
  createdAt: string;
  agents: Agent[];
}

// Enhanced creator stats
interface CreatorStats {
  totalAgents: number;
  bestPerformingAgent: {
    name: string;
    pnl: number;
    id: string;
  } | null;
  avgPnl: number;
  totalHolders: number;
}

// Add mock performance data to Agent type for this page
type AgentWithPerformance = Agent & { performance: Performance };

// Mock API Function - Add performance data to mock agents
async function fetchCreatorDetails(
  creatorId: string,
): Promise<CreatorDetail | null> {
  console.log(`Fetching details for creator: ${creatorId}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Helper to generate mock performance data
  const generateMockPerformance = (agent: Agent): Performance => ({
    id: `perf-${agent.id}-${Date.now()}`,
    agentId: agent.id,
    timestamp: new Date().toISOString(),
    period: 'daily', // Or mock different periods
    successRate: 50 + (agent.performanceIndex || 5) * 5, // % based on performance
    profitLoss: (agent.performanceIndex || 0) * 100 - (agent.creativityIndex || 0) * 10 + (Math.random() - 0.5) * 500, // Mock PnL
    tradeCount: (agent.holders || 10) * 5 + Math.floor(Math.random() * 50), // Mock trades
    performanceScore: (agent.performanceIndex || 0) * 10, // Mock score
    averageReturn: (agent.performanceIndex || 0) * 0.01 + (Math.random() - 0.5) * 0.05, // Mock avg return
  });

  // Define a minimal mock CharacterConfig to satisfy the type
  const mockCharacterConfig: Partial<CharacterConfig> = {
    bio: [], // Ensure bio is an array as expected
  };

  const mockCreators: CreatorDetail[] = [
    {
      id: '1', 
      name: 'Alice Wonderland', 
      totalPnl: 150.75, 
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), 
      avatarUrl: 'https://avatar.vercel.sh/alice',
      agents: [
        { 
          id: 'agent-101', 
          name: 'Cheshire Cat Strategist', 
          symbol: 'CCS', 
          type: 'leftcurve' as AgentType, 
          status: 'live' as AgentStatus,
          price: 1.2, 
          marketCap: 12000, 
          holders: 50, 
          creator: '1', 
          createdAt: new Date().toISOString(), 
          contractAddress: `0x${Math.random().toString(16).substring(2, 12)}`, 
          profilePictureUrl: 'https://avatar.vercel.sh/cheshire', 
          characterConfig: { ...mockCharacterConfig, bio: ['Always grinning.'] },
          creativityIndex: 8,
          performanceIndex: 7,
          abi: [],
        },
        { 
          id: 'agent-102', 
          name: 'Mad Hatter Momentum', 
          symbol: 'MHM', 
          type: 'rightcurve' as AgentType, 
          status: 'live' as AgentStatus,
          price: 0.8, 
          marketCap: 8000, 
          holders: 30, 
          creator: '1', 
          createdAt: new Date().toISOString(), 
          contractAddress: `0x${Math.random().toString(16).substring(2, 12)}`, 
          characterConfig: { ...mockCharacterConfig, bio: ['A bit unpredictable.'] },
          creativityIndex: 9,
          performanceIndex: 6,
          abi: [],
        },
      ].map(agent => ({ ...agent, performance: generateMockPerformance(agent as Agent) })) as unknown as AgentWithPerformance[],
    },
    {
      id: '6', 
      name: 'Frank Sinatra', 
      totalPnl: 35500.5,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(), 
      avatarUrl: 'https://avatar.vercel.sh/frank',
      agents: [
        { 
          id: 'agent-601', 
          name: "Ol' Blue Eyes Oracle", 
          symbol: 'OBO', 
          type: 'leftcurve' as AgentType, 
          status: 'live' as AgentStatus,
          price: 5.5, 
          marketCap: 550000, 
          holders: 200, 
          creator: '6', 
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), 
          contractAddress: `0x${Math.random().toString(16).substring(2, 12)}`, 
          profilePictureUrl: 'https://avatar.vercel.sh/franky', 
          characterConfig: { ...mockCharacterConfig, bio: ['Smooth operator with a knack for timing the market.'] },
          creativityIndex: 7,
          performanceIndex: 9,
          abi: [],
        },
        { 
          id: 'agent-602', 
          name: "New York Trader", 
          symbol: 'NYT', 
          type: 'leftcurve' as AgentType, 
          status: 'live' as AgentStatus,
          price: 8.2, 
          marketCap: 820000, 
          holders: 310, 
          creator: '6', 
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(), 
          contractAddress: `0x${Math.random().toString(16).substring(2, 12)}`, 
          profilePictureUrl: 'https://avatar.vercel.sh/newyork', 
          characterConfig: { ...mockCharacterConfig, bio: ['If I can make it there, I can make it anywhere.'] },
          creativityIndex: 8,
          performanceIndex: 9.5,
          abi: [],
        },
        { 
          id: 'agent-603', 
          name: "Moonlight Swing", 
          symbol: 'MLS', 
          type: 'rightcurve' as AgentType, 
          status: 'live' as AgentStatus,
          price: 3.6, 
          marketCap: 320000, 
          holders: 180, 
          creator: '6', 
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), 
          contractAddress: `0x${Math.random().toString(16).substring(2, 12)}`, 
          profilePictureUrl: 'https://avatar.vercel.sh/moonlight', 
          characterConfig: { ...mockCharacterConfig, bio: ['Trading under the moonlight, swinging with the market.'] },
          creativityIndex: 6,
          performanceIndex: 8,
          abi: [],
        },
        { 
          id: 'agent-604', 
          name: "Vegas Odds", 
          symbol: 'VGO', 
          type: 'leftcurve' as AgentType, 
          status: 'live' as AgentStatus,
          price: 2.1, 
          marketCap: 210000, 
          holders: 120, 
          creator: '6', 
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), 
          contractAddress: `0x${Math.random().toString(16).substring(2, 12)}`, 
          profilePictureUrl: 'https://avatar.vercel.sh/vegas', 
          characterConfig: { ...mockCharacterConfig, bio: ['What happens in Vegas, makes you money.'] },
          creativityIndex: 7.5,
          performanceIndex: 6.5,
          abi: [],
        },
        { 
          id: 'agent-605', 
          name: "Chicago Trader", 
          symbol: 'CHI', 
          type: 'rightcurve' as AgentType, 
          status: 'live' as AgentStatus,
          price: 1.8, 
          marketCap: 180000, 
          holders: 110, 
          creator: '6', 
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), 
          contractAddress: `0x${Math.random().toString(16).substring(2, 12)}`, 
          profilePictureUrl: 'https://avatar.vercel.sh/chicago', 
          characterConfig: { ...mockCharacterConfig, bio: ['My kind of town, Chicago is.'] },
          creativityIndex: 6.5,
          performanceIndex: 7,
          abi: [],
        },
      ].map(agent => ({ ...agent, performance: generateMockPerformance(agent as Agent) })) as unknown as AgentWithPerformance[],
    },
    {
      id: '3', 
      name: 'Charlie Chaplin', 
      totalPnl: 1200.0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      agents: [] as AgentWithPerformance[],
    },
  ];

  const creator = mockCreators.find((c) => c.id === creatorId);

  if (!creator) {
    return null;
  }
  // Ensure agents are correctly typed before returning - safe cast
  creator.agents = creator.agents as AgentWithPerformance[];

  return creator;
}

// Calculate creator stats from their agents data
function calculateCreatorStats(creator: CreatorDetail): CreatorStats {
  // Cast agents to AgentWithPerformance inside the function
  const agentsWithPerf = creator.agents as AgentWithPerformance[];
  const totalAgents = agentsWithPerf.length;
  
  let bestPerformingAgent = null;
  let totalHolders = 0;
  let totalAgentPnl = 0;
  
  if (totalAgents > 0) {
    const agentsWithPnl = agentsWithPerf.map(agent => {
      // Access PnL from the performance object
      const agentPnl = agent.performance.profitLoss;
      totalAgentPnl += agentPnl;
      totalHolders += agent.holders || 0;
      return { ...agent, pnl: agentPnl }; // Keep pnl here for reduce logic if needed, or remove if not used
    });
    
    let bestAgent = null;
    for (const agent of agentsWithPerf) { // Iterate over agentsWithPerf
      if (!bestAgent || agent.performance.profitLoss > (bestAgent as AgentWithPerformance).performance.profitLoss) {
        bestAgent = agent;
      }
    }
      
    if (bestAgent) {
      bestPerformingAgent = {
        name: (bestAgent as AgentWithPerformance).name,
        // Use PnL from performance object
        pnl: (bestAgent as AgentWithPerformance).performance.profitLoss,
        id: (bestAgent as AgentWithPerformance).id
      };
    }
  }
  
  return {
    totalAgents,
    bestPerformingAgent,
    avgPnl: totalAgents > 0 ? totalAgentPnl / totalAgents : 0,
    totalHolders
  };
}

interface CreatorPageParams {
  params: {
    creatorId: string;
  };
}

// --- New Component for Creator Stats ---
interface CreatorStatsDisplayProps {
  stats: CreatorStats;
  formatPnl: (pnl: number) => string;
}

function CreatorStatsDisplay({ stats, formatPnl }: CreatorStatsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total Agents Card - Apply solid card background */}
      <div className="bg-card rounded-lg p-4 border border-gray-800/30 shadow-sm">
        <div className="flex items-center mb-2">
          <Users className="w-4 h-4 mr-2 text-primary" />
          <h3 className="font-medium">Total Agents</h3>
        </div>
        <p className="text-2xl font-bold">{stats.totalAgents}</p>
        <p className="text-sm text-muted-foreground">
          Total Holders: {stats.totalHolders}
        </p>
      </div>
      
      {/* Best Performing Agent Card - Apply solid card background */}
      <div className="bg-card rounded-lg p-4 border border-gray-800/30 shadow-sm">
        <div className="flex items-center mb-2">
          <TrendingUp className="w-4 h-4 mr-2 text-primary" />
          <h3 className="font-medium">Best Performing Agent</h3>
        </div>
        {stats.bestPerformingAgent ? (
          <>
            <p className="text-xl font-bold truncate">
              {stats.bestPerformingAgent.name}
            </p>
            <p className="text-sm text-muted-foreground">
              PnL: {formatPnl(stats.bestPerformingAgent.pnl)}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">No agents yet</p>
        )}
      </div>
      
      {/* Average Performance Card - Apply solid card background */}
      <div className="bg-card rounded-lg p-4 border border-gray-800/30 shadow-sm">
        <div className="flex items-center mb-2">
          <BarChart className="w-4 h-4 mr-2 text-primary" />
          <h3 className="font-medium">Average Performance</h3>
        </div>
        <p className="text-2xl font-bold">{formatPnl(stats.avgPnl)}</p>
        <p className="text-sm text-muted-foreground">
          Across all agents
        </p>
      </div>
    </div>
  );
}

// --- New Component: Agent Performance Card ---
interface AgentPerformanceCardProps {
  agent: AgentWithPerformance;
  by: string;
  formatPnl: (pnl: number) => string;
  className?: string;
}

// Simplified StatItem logic for this specific card
const MiniStatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="text-center">
    <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    <div className="text-sm font-semibold font-mono">{value}</div>
  </div>
);

function AgentPerformanceCard({ agent, by, formatPnl, className }: AgentPerformanceCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';
  const isLeftCurve = agent.type === 'leftcurve';

  useEffect(() => {
    if (agent.profilePictureUrl) {
      const fullUrl = agent.profilePictureUrl.startsWith('http')
        ? agent.profilePictureUrl
        : `${backendUrl}${agent.profilePictureUrl}`;
      setImageUrl(fullUrl);
    }
  }, [agent.profilePictureUrl, backendUrl]);

  // Formatters for stats
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;
  const formatScore = (val: number) => val.toFixed(1);

  return (
    <div className={cn("rounded-lg overflow-hidden relative bg-[#232229] text-white border border-gray-800 shadow-md mb-6", className)}>
      <div className="p-4 flex flex-col md:flex-row md:items-start md:space-x-4 relative">
        {/* Agent Avatar - smaller size */}
        <div className="w-12 h-12 relative flex-shrink-0 mb-4 md:mb-0">
          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-orange-500 to-purple-500 p-[1px]">
            <div className="w-full h-full rounded-md overflow-hidden bg-gray-800">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={agent.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                  priority
                  onError={() => setImageUrl(null)} // Handle image error
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <span className="text-xl">{isLeftCurve ? '🦧' : '🐙'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-grow">
          {/* Top Row: Name, Badges, Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-900/30 text-xs h-5 px-1.5 rounded-full">Active</Badge>
                <Badge variant="outline" className="text-orange-400 border-orange-400/50 bg-orange-900/30 text-xs h-5 px-1.5 rounded-full">Parent</Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400/50 bg-purple-900/30 text-xs h-5 px-1.5 rounded-full">{agent.type === 'leftcurve' ? 'Left Curve' : 'Right Curve'}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              {/* Tooltip for Fork Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-600 to-purple-600 text-white hover:opacity-90 flex items-center border border-white/20 opacity-80 cursor-not-allowed"
                      disabled // Explicitly disable
                    >
                      <GitFork className="mr-1.5 h-4 w-4" />
                      Fork
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 border border-gray-700 text-white">
                    <p className="text-sm font-medium">Forking coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="outline" size="sm" asChild className="border-gray-700 hover:bg-gray-700/50">
                <Link href={`/agent/${agent.id}`} className="flex items-center">
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  View
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Row */}          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-gray-800/50 rounded-md border border-gray-700/60">
            <MiniStatItem label="PnL (USD)" value={formatPnl(agent.performance.profitLoss)} />
            <MiniStatItem label="Success Rate" value={formatPercent(agent.performance.successRate)} />
            <MiniStatItem label="Trades" value={agent.performance.tradeCount.toLocaleString()} />
            <MiniStatItem label="Score" value={formatScore(agent.performance.performanceScore)} />
          </div>
        </div>
      </div>
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-purple-500"></div>
    </div>
  );
}

// --- New Component: Agent List for Creator ---
interface AgentListForCreatorProps {
  agents: AgentWithPerformance[];
  creatorName: string;
  formatPnl: (pnl: number) => string;
}

function AgentListForCreator({ agents, creatorName, formatPnl }: AgentListForCreatorProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-300 pb-2">
        Agents by {creatorName}
      </h2>
      {agents.length > 0 ? (
        <div className="space-y-6">
          {agents.map((agent) => (
            <AgentPerformanceCard 
              key={agent.id} 
              agent={agent}
              by={creatorName} // Pass creator name
              formatPnl={formatPnl} // Pass formatter
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-6">
          This creator hasn&apos;t launched any agents yet.
        </p>
      )}
    </div>
  );
}

// --- Main Content Component ---
function CreatorDetailContent(props: { creatorId: string }) {
  const { creatorId } = props;
  const [creator, setCreator] = useState<CreatorDetail | null>(null);
  const [creatorStats, setCreatorStats] = useState<CreatorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCreatorDetails(creatorId);
        if (!data) {
          setError('Creator not found.');
        } else {
          setCreator(data);
          setCreatorStats(calculateCreatorStats(data));
        }
      } catch (err) {
        console.error('Error fetching creator details:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load creator details',
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [creatorId]);

  const formatPnl = (pnl: number) => {
    return pnl.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'always',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <main className="flex min-h-screen flex-col relative">
      {/* Background image */}
      <div className="fixed inset-0 z-0 w-screen h-screen">
        <Image
          src="/Group 5749-min.jpg"
          alt="Background Pattern"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Gradient overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-orange-600/30 via-transparent to-purple-600/30 pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 py-6 pt-28 relative z-10">
        {/* Back button */}
        <Link
          href="/creators"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Creators
        </Link>

        {isLoading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md text-center">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && creator && creatorStats && (
          <div className="bg-[rgb(246,236,231)] text-gray-900 rounded-lg p-6 shadow-lg border border-gray-300">
            {/* Creator Header Info */}
            <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6 mb-8">
              <Avatar className="w-20 h-20 mb-4 sm:mb-0">
                <AvatarImage
                  src={creator.avatarUrl}
                  alt={`${creator.name}'s avatar`}
                />
                <AvatarFallback>
                  {creator.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold mb-1">{creator.name}</h1>
                <p className="text-gray-600 text-sm">
                  Joined: {new Date(creator.createdAt).toLocaleDateString()} -
                  PnL: {formatPnl(creator.totalPnl)}
                </p>
              </div>
            </div>
            
            {/* Creator Stats - Use the new component */}
            <CreatorStatsDisplay stats={creatorStats} formatPnl={formatPnl} />

            {/* Agents List - Use the new component */}
            <AgentListForCreator 
              agents={creator.agents as AgentWithPerformance[]} // Cast here
              creatorName={creator.name} 
              formatPnl={formatPnl} 
            />
          </div>
        )}
      </div>
    </main>
  );
}

// Main page component - using Next.js' params as a Promise
export default function CreatorDetailPage({ params }: CreatorPageParams) {
  // Use React.use() to unwrap params Promise as recommended by Next.js
  const unwrappedParams = use(params as unknown as Promise<{ creatorId: string }>);
  const { creatorId } = unwrappedParams;
  
  return <CreatorDetailContent creatorId={creatorId} />;
}
