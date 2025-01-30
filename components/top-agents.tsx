'use client';

import { memo, useEffect, useRef, useState, useMemo } from 'react';
import { Agent } from '@/lib/types';
import { motion } from 'framer-motion';
import { UserCircle, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface AgentListProps {
  title: string;
  subtitle: string;
  agents: Agent[];
  type: 'leftcurve' | 'rightcurve';
}

const AgentItem = memo(
  ({
    agent,
    type,
    index,
  }: {
    agent: Agent;
    type: 'leftcurve' | 'rightcurve';
    index: number;
  }) => (
    <Link href={`/agent/${agent.id}`}>
      <motion.div
        className={cn(
          'group rounded-lg p-2 transition-all duration-200 cursor-pointer',
          type === 'leftcurve'
            ? 'hover:bg-orange-500/10 hover:border-orange-500/30'
            : 'hover:bg-purple-500/10 hover:border-purple-500/30',
          index % 5 === 0 && 'bg-white/5',
        )}
        initial={{ opacity: 0, x: type === 'leftcurve' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 * (index % 5) }}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 relative rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
              {agent.avatar ? (
                <AgentAvatar src={agent.avatar} alt={agent.name} />
              ) : (
                <UserCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            {index % 5 === 0 && (
              <div
                className={cn(
                  'absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px]',
                  type === 'leftcurve' ? 'bg-orange-500' : 'bg-purple-500',
                )}
              >
                👑
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={cn(
                    'font-medium text-xs transition-colors truncate flex items-center gap-1.5',
                    type === 'leftcurve'
                      ? 'group-hover:text-orange-500'
                      : 'group-hover:text-purple-500',
                  )}
                >
                  {agent.name}
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ${agent.symbol}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {agent.holders.toLocaleString()} holders
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px]">
                  ${agent.price.toFixed(2)}
                </div>
                <div
                  className={cn(
                    'font-mono text-[10px] font-bold',
                    type === 'leftcurve'
                      ? 'text-orange-500'
                      : 'text-purple-500',
                  )}
                >
                  {(
                    (type === 'leftcurve'
                      ? agent.creativityIndex
                      : agent.performanceIndex) * 100
                  ).toFixed(0)}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  ),
);
AgentItem.displayName = 'AgentItem';

const AgentList = memo(({ title, subtitle, agents, type }: AgentListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const sortedAgents = useMemo(
    () =>
      [...agents]
        .filter((a) => a.type === type)
        .sort((a, b) => {
          const scoreA =
            type === 'leftcurve' ? a.creativityIndex : a.performanceIndex;
          const scoreB =
            type === 'leftcurve' ? b.creativityIndex : b.performanceIndex;
          return scoreB - scoreA;
        })
        .slice(0, 5),
    [agents, type],
  );

  const loopedAgents = useMemo(() => {
    // Only create a loop if we have at least 3 agents
    if (sortedAgents.length >= 3) {
      return [...sortedAgents, ...sortedAgents, ...sortedAgents];
    }
    // Otherwise just show what we have
    return sortedAgents;
  }, [sortedAgents]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || sortedAgents.length < 3) return; // Don't scroll if not enough agents

    const scroll = () => {
      if (isPaused) return;

      const maxScroll = container.scrollHeight / 3;
      if (container.scrollTop >= maxScroll * 2 || container.scrollTop <= 0) {
        container.scrollTop = maxScroll;
      } else {
        // Slower scroll speed when fewer agents
        const scrollSpeed = Math.min(1, sortedAgents.length / 5);
        container.scrollTop +=
          type === 'leftcurve' ? -scrollSpeed : scrollSpeed;
      }
    };

    container.scrollTop = container.scrollHeight / 3;
    const intervalId = setInterval(scroll, 30);
    return () => clearInterval(intervalId);
  }, [type, isPaused, sortedAgents.length]);

  const emoji = type === 'leftcurve' ? '🦧' : '🐙';
  const Icon = type === 'leftcurve' ? Sparkles : Zap;

  return (
    <motion.div
      className={cn(
        'rounded-xl border p-3 backdrop-blur-sm flex-1',
        type === 'leftcurve'
          ? 'border-orange-500/20 bg-orange-950/5 hover:border-orange-500/30'
          : 'border-purple-500/20 bg-purple-950/5 hover:border-purple-500/30',
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: type === 'leftcurve' ? 0.2 : 0.4 }}
    >
      <div className="mb-2">
        <h2
          className={cn(
            'font-sketch text-2xl text-center flex items-center justify-center gap-2',
            type === 'leftcurve' ? 'text-orange-500' : 'text-purple-500',
          )}
        >
          {type === 'leftcurve' ? (
            <>
              {emoji} {title} <Icon className="w-5 h-5 animate-pulse" />
            </>
          ) : (
            <>
              <Icon className="w-5 h-5 animate-pulse" /> {title} {emoji}
            </>
          )}
        </h2>
        <p
          className={cn(
            'text-xs font-mono text-center',
            type === 'leftcurve' ? 'text-orange-500/50' : 'text-purple-500/50',
          )}
        >
          {subtitle}
        </p>
      </div>

      <div
        ref={containerRef}
        className="h-[240px] overflow-hidden relative px-2 space-y-1.5"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {loopedAgents.map((agent, index) => (
          <AgentItem
            key={`${agent.id}-${index}`}
            agent={agent}
            type={type}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
});
AgentList.displayName = 'AgentList';

const LoadingState = () => (
  <div className="flex gap-4">
    {[0, 1].map((i) => (
      <div key={i} className="flex-1 rounded-xl border border-border p-3">
        <div className="space-y-2 mb-4">
          <Skeleton className="h-8 w-40 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, j) => (
            <Skeleton key={j} className="h-12 w-full" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

interface TopAgentsProps {
  agents: Agent[];
  isLoading?: boolean;
  error?: Error | null;
}

export const TopAgents = memo(
  ({ agents, isLoading = false, error = null }: TopAgentsProps) => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return (
        <div className="text-center text-sm text-red-500">
          Failed to load agents: {error.message}
        </div>
      );
    }

    if (!agents) {
      return null;
    }

    return (
      <div className="space-y-2">
        <div className="flex gap-4">
          <AgentList
            title="DEGEN KINGS"
            subtitle="yolo masters farming midcurver rekt posts"
            agents={agents}
            type="leftcurve"
          />
          <AgentList
            title="SIGMA LORDS"
            subtitle="gigabrain quants making midcurvers ngmi"
            agents={agents}
            type="rightcurve"
          />
        </div>
        <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500 font-mono">
          <span>midcurvers staying ngmi since 2024</span>
        </div>
      </div>
    );
  },
);
TopAgents.displayName = 'TopAgents';
