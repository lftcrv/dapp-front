'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCreationStatus } from '@/actions/agents/create/getCreationStatus';
import { DeployingStateWithOrchestration } from '@/components/orchestration/deploying-state-orchestration';

interface DeployingPageProps {
  params: {
    orchestrationId: string;
  };
}

export default function DeployingPage({ params }: DeployingPageProps) {
  const { orchestrationId } = params;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <DeployingStateWithOrchestration
      orchestrationId={orchestrationId}
      error={error}
      onError={(msg) => setError(msg)}
    />
  );
}
