'use client';

import { Suspense } from 'react';
import { TopAgents } from '@/components/top-agents';
import { TopAgentsSkeleton } from '@/components/home-skeleton';
import EmptyState from '@/components/ui/empty-state';

// Using any as a fallback since we don't have direct access to the Agent type
type Agent = any;

type TopAgentsSectionProps = {
  agents: Agent[] | undefined | null;
  isLoading: boolean;
  error: Error | null;
  isRefetching: boolean;
  handleRetry: () => Promise<void>;
};

export default function TopAgentsSection({ 
  agents, 
  isLoading, 
  error, 
  isRefetching, 
  handleRetry 
}: TopAgentsSectionProps) {
  return (
    <div className="mb-12">
      <div className="bg-[#F0E6E1] rounded-xl p-6 shadow-sm">
        <h2 className="font-sketch text-3xl mb-6 flex items-center justify-center">
          <span className="mr-2">Alpha Agents: Cycle&apos;s Finest</span>
          <span className="text-yellow-500">💰</span>
        </h2>
        <Suspense fallback={<TopAgentsSkeleton />}>
          {error ? (
            <EmptyState
              title="Couldn't Load Agents"
              description="We encountered an issue while fetching the agents data. Please try again."
              icon="agents"
              onRetry={handleRetry}
              isLoading={isRefetching}
            />
          ) : !agents || agents.length === 0 ? (
            <EmptyState
              title="No Agents Found"
              description="Be the first to create an agent and start competing in the arena!"
              icon="agents"
              onRetry={handleRetry}
              isLoading={isRefetching}
            />
          ) : (
            <TopAgents agents={agents} isLoading={isLoading} error={error} />
          )}
        </Suspense>
      </div>
    </div>
  );
} 