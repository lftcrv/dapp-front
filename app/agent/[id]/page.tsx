import { tradeService } from '@/lib/services/api/trades';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { AgentContent } from './agent-content';
import { DeployingState } from './deploying-state';
import { getCompleteAgentData } from '@/actions/agents/token/getTokenInfo';

// Mark this page as dynamic to skip static build
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable static page generation

// Cache the getPageData function with a 5-second revalidation
const getCachedPageData = unstable_cache(
  async (agentId: string) => {
    // Get all agent data in a single call
    const agentResult = await getCompleteAgentData(agentId);

    if (!agentResult.success || !agentResult.data) {
      console.error('❌ Failed to fetch agent:', agentResult.error);
      return { error: agentResult.error || 'Agent not found' };
    }

    // Get trades separately as they're not part of the agent endpoint
    const tradesResult = await tradeService.getByAgent(agentId);

    return {
      agent: agentResult.data,
      trades:
        tradesResult.success && tradesResult.data ? tradesResult.data : [],
    };
  },
  ['agent-page-data'],
  {
    revalidate: 5,
    tags: ['agent-data'],
  },
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentPage({ params }: PageProps) {
  const { id: agentId } = await params;

  if (!agentId) {
    notFound();
  }

  const { agent, trades, error } = await getCachedPageData(agentId);

  if (error || !agent) {
    notFound();
  }

  // Check for valid contract address
  const isDeploying = !agent.contractAddress || agent.contractAddress === '0x0';

  // If the agent is still deploying, show the auto-refreshing deploying page
  if (isDeploying) {
    return <DeployingState agent={agent} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-7xl mx-auto px-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          }
        >
          <AgentContent agent={agent} initialTrades={trades} />
        </Suspense>
      </div>
    </main>
  );
}
