'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { formatPnL } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


// Type definition for CreatorLeaderboardEntryDto based on DTO in creator_doc.md
export interface CreatorLeaderboardEntryDto {
  creatorId: string;
  totalAgents: number;
  runningAgents: number;
  totalBalanceInUSD: number;
  aggregatedPnlCycle: number;
  aggregatedPnl24h: number;
  bestAgentId?: string;
  bestAgentPnlCycle?: number;
  updatedAt: Date;
}

// Agent data type from API
interface Agent {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface CreatorCardProps {
  creator: CreatorLeaderboardEntryDto;
  index: number;
}

const CreatorCard = ({ creator, index }: CreatorCardProps) => {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // Fetch agents for this creator
  useEffect(() => {
    const fetchAgents = async () => {
      if (!creator.creatorId) return;

      setIsLoadingAgents(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8080/api/creators/${creator.creatorId}/agents`,
          {
            headers: {
              'x-api-key': 'secret',
            },
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          console.error(
            'API response not OK:',
            response.status,
            response.statusText,
          );
          throw new Error('Failed to fetch agents');
        }

        const data = await response.json();
        console.log('Agents data received:', data);

        // Verify we're getting the data in the expected format
        if (data && Array.isArray(data.data)) {
          setAgents(data.data);
        } else {
          console.error('Unexpected data format:', data);
          setAgents([]);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        setAgents([]);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, [creator.creatorId]);

  // Navigation handlers
  const navigateToCreator = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/creators/${creator.creatorId}`);
  };

  const navigateToAgent = (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation();
    router.push(`/agent/${agentId}`);
  };

  // Determine color based on index to alternate between purple and orange
  const isEven = index % 2 === 0;
  const bgColor = isEven ? 'bg-[#B27CF4]' : 'bg-[#D97B4F]'; // Purple : Orange
  const bgHoverColor = isEven ? 'hover:bg-[#9e63e9]' : 'hover:bg-[#c66c3c]'; // Darker on hover
  const badgeBgColor = isEven ? 'bg-[#9058D8]/30' : 'bg-[#C36538]/30'; // Semi-transparent badge

  // Shorten creator ID for display (can be replaced with real name in future)
  const displayName = (() => {
    const id = creator.creatorId;
    if (id.length <= 10) return id;
    return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`;
  })();

  return (
    <div className="h-full">
      <div
        className={`${bgColor} ${bgHoverColor} rounded-xl p-4 h-full flex flex-col transition-all duration-300 shadow-sm group`}
      >
        {/* Header section with creator info and agent avatars */}
        <div className="flex justify-between items-start mb-3">
          {/* Creator info with clickable avatar */}
          <div className="flex items-center gap-2">
            <div onClick={navigateToCreator} className="cursor-pointer">
              <Avatar className="h-10 w-10 border-2 border-white/30 ring-1 ring-white/10 shadow-md">
                <AvatarFallback className="bg-white/20 text-white font-bold">
                  {displayName.substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              <h3 className="text-white font-bold truncate max-w-[120px] font-sketch leading-tight">
                {displayName}
              </h3>
              <div className="flex items-center">
                <span className="text-white/70 text-xs">
                  {creator.runningAgents}/{creator.totalAgents} agents
                </span>
              </div>
            </div>
          </div>

          {/* Agent avatars group in top right - clickable */}
          {creator.totalAgents > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {isLoadingAgents
                      ? // Show placeholder avatars while loading
                        Array.from({
                          length: Math.min(creator.totalAgents, 2),
                        }).map((_, i) => (
                          <Avatar
                            key={`loading-${i}`}
                            className="h-6 w-6 border border-white/30 ring-1 ring-white/10"
                          >
                            <AvatarFallback
                              className={`text-[10px] ${
                                i % 2 === 0
                                  ? 'bg-purple-500/40'
                                  : 'bg-orange-500/40'
                              } text-white animate-pulse`}
                            >
                              ...
                            </AvatarFallback>
                          </Avatar>
                        ))
                      : agents.length > 0
                      ? // Show actual agents when loaded
                        agents.slice(0, 2).map((agent, i) => (
                          <div
                            key={agent.id}
                            onClick={(e) => navigateToAgent(e, agent.id)}
                            className="cursor-pointer"
                          >
                            <Avatar
                              className={`h-6 w-6 border border-white/30 ring-1 ${
                                agent.status === 'RUNNING'
                                  ? 'ring-green-500/40'
                                  : 'ring-white/10'
                              }`}
                            >
                              <AvatarFallback
                                className={`text-[10px] ${
                                  i % 2 === 0
                                    ? 'bg-purple-500/40'
                                    : 'bg-orange-500/40'
                                } text-white`}
                              >
                                {agent.name.substring(0, 1).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        ))
                      : // Show fallback avatars if no agents are found
                        Array.from({
                          length: Math.min(creator.totalAgents, 2),
                        }).map((_, i) => (
                          <Avatar
                            key={`fallback-${i}`}
                            className="h-6 w-6 border border-white/30 ring-1 ring-white/10"
                          >
                            <AvatarFallback
                              className={`text-[10px] ${
                                i % 2 === 0
                                  ? 'bg-purple-500/40'
                                  : 'bg-orange-500/40'
                              } text-white`}
                            >
                              {String.fromCharCode(65 + i)}
                            </AvatarFallback>
                          </Avatar>
                        ))}

                    {/* Show count if there are more than 2 agents */}
                    {creator.totalAgents > 2 && (
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-black/30 border border-white/20 text-white text-[10px] font-medium">
                        +{creator.totalAgents - 2}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 border border-gray-700 text-white p-2 max-w-xs">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold pb-1 border-b border-gray-700">
                      Creator&apos;s Agents ({creator.runningAgents} active)
                    </p>
                    {isLoadingAgents ? (
                      <div className="py-2 text-xs text-gray-400">
                        Loading agents...
                      </div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto pr-1">
                        {agents.length > 0 ? (
                          agents.map((agent) => (
                            <div
                              key={agent.id}
                              className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-800/50 px-1 rounded"
                              onClick={(e) => navigateToAgent(e, agent.id)}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  agent.status === 'RUNNING'
                                    ? 'bg-green-500'
                                    : 'bg-gray-500'
                                }`}
                              ></div>
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[8px] bg-gray-800 text-white">
                                  {agent.name.substring(0, 1).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-100 truncate">
                                {agent.name}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 text-xs text-gray-400">
                            No agents found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Bento-style metrics grid */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          {/* PnL metrics box */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`${badgeBgColor} rounded-lg p-2 transition-all group-hover:bg-black/20`}
                >
                  <div className="flex items-center mb-1">
                    <span className="text-white/80 text-xs">Cycle PnL</span>
                    <span className="ml-1 text-lg">🔥</span>
                  </div>
                  <div className="text-white font-medium text-sm">
                    {formatPnL(creator.aggregatedPnlCycle, true)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border border-gray-700 text-white max-w-xs">
                <div className="space-y-2 p-1">
                  <h4 className="font-semibold text-sm">Performance Details</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cycle PnL:</span>
                      <span>{formatPnL(creator.aggregatedPnlCycle, true)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">24h PnL:</span>
                      <span>{formatPnL(creator.aggregatedPnl24h, true)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Balance:</span>
                      <span>${creator.totalBalanceInUSD.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Balance box */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`${badgeBgColor} rounded-lg p-2 transition-all group-hover:bg-black/20`}
                >
                  <div className="flex items-center mb-1">
                    <span className="text-white/80 text-xs">Balance</span>
                    <span className="ml-1 text-lg">💰</span>
                  </div>
                  <div className="text-white font-medium text-sm">
                    ${(creator.totalBalanceInUSD / 1000).toFixed(1)}k
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border border-gray-700 text-white">
                <p className="text-xs">
                  ${creator.totalBalanceInUSD.toLocaleString()} total value
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Agent stats box */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`${badgeBgColor} rounded-lg p-2 transition-all group-hover:bg-black/20`}
                >
                  <div className="flex items-center mb-1">
                    <span className="text-white/80 text-xs">Agents</span>
                    <span className="ml-1 text-lg">✨</span>
                  </div>
                  <div className="text-white font-medium text-sm">
                    {creator.totalAgents}
                    <span className="text-white/70 text-xs ml-1">
                      (
                      {Math.round(
                        (creator.runningAgents / creator.totalAgents) * 100,
                      ) || 0}
                      % active)
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border border-gray-700 text-white">
                <div className="text-xs space-y-1">
                  <div>Total agents: {creator.totalAgents}</div>
                  <div>Running: {creator.runningAgents}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 24h PnL box */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`${badgeBgColor} rounded-lg p-2 transition-all group-hover:bg-black/20`}
                >
                  <div className="flex items-center mb-1">
                    <span className="text-white/80 text-xs">24h PnL</span>
                    <span className="ml-1 text-lg">⚡</span>
                  </div>
                  <div className="text-white font-medium text-sm">
                    {formatPnL(creator.aggregatedPnl24h, true)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border border-gray-700 text-white">
                <p className="text-xs">
                  24-hour profit and loss:{' '}
                  {formatPnL(creator.aggregatedPnl24h, true)}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
