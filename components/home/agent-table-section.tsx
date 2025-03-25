'use client';

import { Suspense } from 'react';
import { AgentTable } from '@/components/agents/agent-table';
import { AgentTableSkeleton } from '@/components/home-skeleton';
import EmptyState from '@/components/ui/empty-state';

// Using any as a fallback since we don't have direct access to the Agent type
type Agent = any;

type AgentTableSectionProps = {
  agents: Agent[] | undefined | null;
  isLoading: boolean;
  error: Error | null;
  isRefetching: boolean;
  handleRetry: () => Promise<void>;
};

export default function AgentTableSection({ 
  agents, 
  isLoading, 
  error, 
  isRefetching, 
  handleRetry 
}: AgentTableSectionProps) {
  return (
    <div>
      <div className="bg-[#F0E6E1] rounded-xl p-6 shadow-sm">
        <h2 className="font-sketch text-3xl mb-6 flex items-center justify-center">
          <span className="mr-2">
            From Snipers to Liquidators - Explore the Meta
          </span>
          <span>⚔️</span>
        </h2>
        <Suspense fallback={<AgentTableSkeleton />}>
          {error ? (
            <EmptyState
              title="Couldn't Load Agent Data"
              description="We encountered an issue while fetching the agent data. Please try again."
              icon="table"
              onRetry={handleRetry}
              isLoading={isRefetching}
            />
          ) : !agents || agents.length === 0 ? (
            <EmptyState
              title="No Agents in the Arena"
              description="The arena is waiting for its first competitors. Create an agent to get started!"
              icon="table"
              onRetry={handleRetry}
              isLoading={isRefetching}
            />
          ) : (
            <AgentTable agents={agents} isLoading={isLoading} error={error} />
          )}
        </Suspense>
      </div>
    </div>
  );
} 