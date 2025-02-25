'use client';

import { AlertCircle } from 'lucide-react';
import { useAgents } from '@/hooks/use-agents';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  TopAgentsSkeleton,
  AgentTableSkeleton,
} from '@/components/home-skeleton';
import { HomeContent } from '@/components/home-content';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import type { FC } from 'react';

const HomeHeader = dynamic(
  () =>
    import('@/components/home-header').then((mod) => {
      const Component = mod.default as FC;
      Component.displayName = 'HomeHeader';
      return Component;
    }),
  {
    loading: () => (
      <div className="text-center space-y-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-12 w-[300px] mx-auto bg-white/5 rounded" />
          <div className="h-4 w-[200px] mx-auto bg-white/5 rounded" />
        </div>
      </div>
    ),
    ssr: false,
  },
);

const AgentData = memo(() => {
  const { data: agents, isLoading, error, refetch } = useAgents();

  if (isLoading) {
    return (
      <>
        <TopAgentsSkeleton />
        <AgentTableSkeleton />
      </>
    );
  }

  if (error || !agents || agents.length === 0) {
    return (
      <>
        <TopAgentsSkeleton />
        <div className="mt-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load agents. Please try again.
              <Button
                variant="link"
                onClick={refetch}
                className="ml-2 h-auto p-0"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return <HomeContent agents={agents} isLoading={isLoading} error={error} />;
});
AgentData.displayName = 'AgentData';

export const HomePageContent = memo(() => {
  return (
    <div className="container max-w-7xl mx-auto px-4 pt-2 space-y-8 pb-20">
      <HomeHeader />
      <AgentData />
    </div>
  );
});
HomePageContent.displayName = 'HomePageContent';
