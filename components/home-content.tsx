'use client';
import dynamic from 'next/dynamic';
import { Suspense, memo } from 'react';
import {
  TopAgentsSkeleton,
  AgentTableSkeleton,
} from '@/components/home-skeleton';
import { Agent } from '@/lib/types';
import type { FC } from 'react';

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

const DockerMessageCard = dynamic(
  () => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        import('@/components/trade-call');
      });
    }
    return import('@/components/trade-call').then((mod) => {
      const Component = mod.default as FC; // Removed agent prop type
      Component.displayName = 'DockerMessageCard';
      return Component;
    });
  },
  {
    loading: () => (
      <div className="h-[400px] bg-white/5 rounded animate-pulse" />
    ),
    ssr: false,
  },
);

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
        {/* <Suspense
          fallback={
            <div className="h-[400px] bg-white/5 rounded animate-pulse" />
          }
        >
          <div className="mt-8">
            <DockerMessageCard />
          </div>
        </Suspense> */}
      </>
    );
  },
);

HomeContent.displayName = 'HomeContent';
