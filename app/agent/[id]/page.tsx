import { agentService } from '@/lib/services/api/agents';
import { tradeService } from '@/lib/services/api/trades';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { AgentContent } from './agent-content';

// Generate static params for known agents
export async function generateStaticParams() {
  const result = await agentService.getAll();
  if (!result.success || !result.data) return [];

  return result.data.map((agent) => ({
    id: agent.id,
  }));
}

// Cache the page for 5 seconds
export const revalidate = 5;

// Cache the getPageData function with a 5-second revalidation
const getCachedPageData = unstable_cache(
  async (agentId: string) => {
    console.log(`[Server] 🔍 Fetching data for agent ${agentId}`);
    const startTime = Date.now();

    const [agentResult, tradesResult] = await Promise.all([
      agentService.getById(agentId),
      tradeService.getByAgent(agentId)
    ]);

    if (!agentResult.success || !agentResult.data) {
      console.error(`[Server] ❌ Agent not found: ${agentId}`);
      return { error: agentResult.error?.message || 'Agent not found' };
    }

    const duration = Date.now() - startTime;
    console.log(`[Server] ✅ Found agent ${agentId} with ${tradesResult.success ? tradesResult.data?.length : 0} trades (${duration}ms)`);
    
    return { 
      agent: agentResult.data,
      trades: tradesResult.success ? tradesResult.data : []
    };
  },
  ['agent-page-data'],
  { 
    revalidate: 5, 
    tags: ['agent-data']
  }
);

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AgentPage({ params }: PageProps) {
  // Await params first
  const resolvedParams = await Promise.resolve(params);
  const agentId = resolvedParams.id;
  
  console.log(`[Server] 📄 Page requested for agent ${agentId}`);
  
  if (!agentId) {
    console.log(`[Server] ❌ No agent ID provided`);
    notFound();
  }

  const { agent, trades, error } = await getCachedPageData(agentId);
  
  if (error || !agent) {
    console.log(`[Server] ❌ Error or no agent found: ${error}`);
    notFound();
  }

  console.log(`[Server] ✅ Rendering page for agent ${agentId}`);
  
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