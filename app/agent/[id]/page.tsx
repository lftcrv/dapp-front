import { agentService } from '@/lib/services/api/agents';
import { tradeService } from '@/lib/services/api/trades';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { AgentContent } from './agent-content';

// Mark this page as dynamic to skip static build
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable static page generation

// Cache the getPageData function with a 5-second revalidation
const getCachedPageData = unstable_cache(
  async (agentId: string) => {
    const [agentResult, tradesResult] = await Promise.all([
      agentService.getById(agentId),
      tradeService.getByAgent(agentId),
    ]);

    if (!agentResult.success || !agentResult.data) {
      return { error: agentResult.error?.message || 'Agent not found' };
    }

    return {
      agent: agentResult.data,
      trades: tradesResult.success ? tradesResult.data : [],
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-7xl mx-auto px-4">
        <Suspense>
          <AgentContent agent={agent} initialTrades={trades} />
        </Suspense>
      </div>
    </main>
  );
}
