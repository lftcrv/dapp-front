'use client';

import dynamic from 'next/dynamic';
import { Suspense, memo } from 'react';
import {
  TopAgentsSkeleton,
  AgentTableSkeleton,
} from '@/components/home-skeleton';
import { Agent } from '@/lib/types';
import type { FC } from 'react';

// Preload components during idle time
const TopAgents = dynamic(
  () => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        import('@/components/top-agents');
      });
    }
    return import('@/components/top-agents').then((mod) => {
      const Component = mod.TopAgents as FC<{
        agents: Agent[];
        isLoading?: boolean;
        error?: Error | null;
      }>;
      Component.displayName = 'TopAgents';
      return Component;
    });
  },
  {
    loading: () => <TopAgentsSkeleton />,
    ssr: false,
  },
);

const AgentsContainer = dynamic(
  () => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        import('@/components/agents/agents-container');
      });
    }
    return import('@/components/agents/agents-container').then((mod) => {
      const Component = mod.AgentsContainer as FC<{
        agents: Agent[];
        isLoading: boolean;
        error: Error | null;
      }>;
      Component.displayName = 'AgentsContainer';
      return Component;
    });
  },
  {
    loading: () => <AgentTableSkeleton />,
    ssr: false,
  },
);

// const DockerMessageCard = dynamic(() => import('./docker-message-card'));

interface HomeContentProps {
  agents: Agent[];
  isLoading?: boolean;
  error?: Error | null;
}

export const HomeContent = memo(
  ({ agents, isLoading = false, error = null }: HomeContentProps) => {
    return (
      <>
        <Suspense fallback={<TopAgentsSkeleton />}>
          <TopAgents agents={agents} isLoading={isLoading} error={error} />
        </Suspense>
        <Suspense fallback={<AgentTableSkeleton />}>
          <AgentsContainer
            agents={agents}
            isLoading={isLoading}
            error={error}
          />
        </Suspense>
        {/* <Suspense fallback={<div className="h-[400px] bg-white/5 rounded animate-pulse" />}>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <DockerMessageCard key={agent.id} agent={agent} />
            ))}
          </div>
        </Suspense> */}
      </>
    );
  }
);
HomeContent.displayName = 'HomeContent';
