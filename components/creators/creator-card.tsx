'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getCreatorAgents, Agent } from '@/actions/creators/getCreatorAgents';
import { ListChecks } from 'lucide-react';

interface CreatorCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  agentCount: number;
  totalPnl: number;
  totalTradeCount?: number;
  balance?: number;
  createdAt: string;
  runningAgents?: number;
  index?: number;
}

export function CreatorCard({
  id,
  name,
  avatarUrl,
  agentCount,
  totalPnl,
  totalTradeCount = 0,
  balance = 0,
  runningAgents = 0,
  index = 0,
}: CreatorCardProps) {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!id) return;
      setIsLoadingAgents(true);
      try {
        const result = await getCreatorAgents(id);
        if (result.success && result.data && Array.isArray(result.data)) {
          setAgents(result.data);
        } else {
          setAgents([]);
        }
      } catch (error) {
        console.error(`Failed to fetch agents for creator ${id}:`, error);
        setAgents([]);
      } finally {
        setIsLoadingAgents(false);
      }
    };
    fetchAgents();
  }, [id]);

  const displayName = name.length > 16 ? `${name.substring(0, 8)}...` : name;
  const fallbackName = name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const formatGenericPnl = (pnlValue: number) => {
    return pnlValue.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'always',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatDisplayCurrency = (amount: number) => {
    if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 10000 && Math.abs(amount) < 1000000) {
       return `$${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
  };

  const formatTradeCount = (count: number) => {
    return count.toLocaleString();
  };

  const isEven = index % 2 === 0;
  const bgColor = isEven ? 'bg-[#B27CF4]' : 'bg-[#D97B4F]';
  const bgHoverColor = isEven ? 'hover:bg-[#9e63e9]' : 'hover:bg-[#c66c3c]';
  const badgeBgColor = isEven ? 'bg-[#9058D8]/30' : 'bg-[#C36538]/30';

  const handleAgentNavigation = (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation();
    router.push(`/agent/${agentId}`);
  };

  return (
    <Link href={`/creators/${id}`} className="block h-full">
      <div className={`${bgColor} ${bgHoverColor} rounded-xl p-4 h-full flex flex-col transition-all duration-300 shadow-md group`}>
        {/* Header section with creator info */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border-2 border-white/30 ring-1 ring-white/10 shadow-md">
              <AvatarImage src={avatarUrl} alt={`${name}'s avatar`} />
              <AvatarFallback className="bg-white/20 text-white font-bold">{fallbackName}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-white font-bold truncate max-w-[120px] leading-tight">{displayName}</h3>
              <div className="flex items-center">
                <span className="text-white/70 text-xs">{runningAgents}/{agentCount} agents</span>
              </div>
            </div>
          </div>

          {/* Agent avatars group with tooltip */}
          {agentCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {isLoadingAgents
                      ? Array.from({ length: Math.min(agentCount, 2) }).map((_, i) => (
                          <Avatar key={`loading-${i}`} className="h-6 w-6 border border-white/30 ring-1 ring-white/10">
                            <AvatarFallback className={`text-[10px] ${i % 2 === 0 ? 'bg-purple-500/40' : 'bg-orange-500/40'} text-white animate-pulse`}>...</AvatarFallback>
                          </Avatar>
                        ))
                      : agents.length > 0
                      ? agents.slice(0, 2).map((agent, i) => (
                          <div key={agent.id} onClick={(e) => handleAgentNavigation(e, agent.id)} className="cursor-pointer">
                            <Avatar className={`h-6 w-6 border border-white/30 ring-1 ${agent.status === 'RUNNING' ? 'ring-green-500/40' : 'ring-white/10'}`}>
                              <AvatarFallback className={`text-[10px] ${i % 2 === 0 ? 'bg-purple-500/40' : 'bg-orange-500/40'} text-white`}>{agent.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          </div>
                        ))
                      : Array.from({ length: Math.min(agentCount, 2) }).map((_, i) => (
                          <Avatar key={`fallback-${i}`} className="h-6 w-6 border border-white/30 ring-1 ring-white/10">
                            <AvatarFallback className={`text-[10px] ${i % 2 === 0 ? 'bg-purple-500/40' : 'bg-orange-500/40'} text-white`}>{String.fromCharCode(65 + i)}</AvatarFallback>
                          </Avatar>
                        ))}
                    {agentCount > 2 && (
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-black/30 border border-white/20 text-white text-[10px] font-medium">+{agentCount - 2}</div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 border border-gray-700 text-white p-2 max-w-xs">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold pb-1 border-b border-gray-700">Creator&apos;s Agents ({runningAgents} active)</p>
                    {isLoadingAgents ? (
                      <div className="py-2 text-xs text-gray-400">Loading agents...</div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto pr-1">
                        {agents.length > 0 ? (
                          agents.map((agent) => (
                            <div key={agent.id} onClick={(e) => handleAgentNavigation(e, agent.id)} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-800/50 px-1 rounded ">
                              <div className={`w-2 h-2 rounded-full ${agent.status === 'RUNNING' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[8px] bg-gray-800 text-white">{agent.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-100 truncate">{agent.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 text-xs text-gray-400">No agents found</div>
                        )}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          {/* Total PnL (Cycle) box */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`${badgeBgColor} rounded-lg p-2 transition-all group-hover:bg-black/20`}>
                  <div className="flex items-center mb-1">
                    <span className="text-white/80 text-xs">Total PnL</span>
                    <span className="ml-1 text-lg">🔥</span>
                  </div>
                  <div className={cn('text-white font-medium text-sm', totalPnl >= 0 ? 'text-green-300' : 'text-red-300', { 'text-white/70': totalPnl === 0 })}>
                    {formatGenericPnl(totalPnl)} 
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border border-gray-700 text-white">
                <p className="text-xs">{formatGenericPnl(totalPnl)} total profit and loss (cycle)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Agents box */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`${badgeBgColor} rounded-lg p-2 transition-all group-hover:bg-black/20`}>
                  <div className="flex items-center mb-1">
                    <span className="text-white/80 text-xs">Agents</span>
                    <span className="ml-1 text-lg">✨</span>
                  </div>
                  <div className="text-white font-medium text-sm">
                    {agentCount}
                    {agentCount > 0 && (
                        <span className="text-white/70 text-xs ml-1">
                        ({Math.round((runningAgents / agentCount) * 100) || 0}% active)
                        </span>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border border-gray-700 text-white">
                <div className="text-xs space-y-1">
                  <div>Total agents: {agentCount}</div>
                  <div>Running: {runningAgents}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Balance box - uses new `balance` prop */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`${badgeBgColor} rounded-lg p-2 transition-all group-hover:bg-black/20`}>
                  <div className="flex items-center mb-1">
                    <span className="text-white/80 text-xs">Balance</span>
                    <span className="ml-1 text-lg">💰</span>
                  </div>
                  <div className="text-white font-medium text-sm">
                    {formatDisplayCurrency(balance)} 
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border border-gray-700 text-white">
                <p className="text-xs">{formatDisplayCurrency(balance)} total value</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Total Trades box - REPLACES 24h PnL box */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`${badgeBgColor} rounded-lg p-2 transition-all group-hover:bg-black/20`}>
                  <div className="flex items-center mb-1">
                    <span className="text-white/80 text-xs">Total Trades</span>
                    <ListChecks className="ml-1 h-4 w-4 text-white/90" />
                  </div>
                  <div className={'text-white font-medium text-sm'}>
                    {formatTradeCount(totalTradeCount || 0)} 
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border border-gray-700 text-white">
                <p className="text-xs">{formatTradeCount(totalTradeCount || 0)} total trades executed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Link>
  );
}

export function CreatorCardSkeleton({ index = 0 }: { index?: number }) {
  const isEven = index % 2 === 0;
  const bgColor = isEven ? 'bg-[#B27CF4]/30' : 'bg-[#D97B4F]/30';

  return (
    <div className={`${bgColor} rounded-xl p-4 h-full flex flex-col min-h-[210px] animate-pulse`}>
      <div className="flex items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-white/20"></div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-white/20 rounded"></div>
            <div className="h-3 w-16 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/10 rounded-lg p-2">
            <div className="h-3 w-12 bg-white/20 rounded mb-2"></div>
            <div className="h-4 w-16 bg-white/20 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
