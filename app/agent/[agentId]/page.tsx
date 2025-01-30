import { agentService } from '@/lib/services/api/agents';
import { AgentContent } from './agent-content';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';

// Generate static params for known agents
export async function generateStaticParams() {
  const result = await agentService.getAll();
  if (!result.success || !result.data) return [];

  return result.data.map((agent) => ({
    agentId: agent.id,
  }));
}

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

async function getAgentData(agentId: string) {
  try {
    // Ensure we're not using cached data
    draftMode();

    const result = await agentService.getById(agentId);

    if (!result.success || !result.data) {
      return { error: result.error?.message || 'Agent not found' };
    }

    return { agent: result.data };
  } catch (err) {
    console.error('Error fetching agent:', err);
    return {
      error: err instanceof Error ? err.message : 'Failed to fetch agent data',
    };
  }
}

interface PageProps {
  params: {
    agentId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AgentPage(props: PageProps) {
  // Ensure params are ready before using them
  const params = await Promise.resolve(props.params);

  // Validate agentId exists
  if (!params?.agentId) {
    notFound();
  }

  const { agent, error } = await getAgentData(params.agentId);

  if (error || !agent) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-7xl mx-auto px-4">
        <Suspense>
          <AgentContent agent={agent} />
        </Suspense>
      </div>
    </main>
  );
}
