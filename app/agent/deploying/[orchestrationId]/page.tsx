'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCreationStatus } from '@/actions/agents/create/getCreationStatus';
import { DeployingStateWithOrchestration } from '@/components/orchestration/deploying-state-orchestration';

interface DeployingPageProps {
  params: {
    orchestrationId: string;
  };
}

export default function DeployingPage({ params }: DeployingPageProps) {
  const { orchestrationId } = params;
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const transactionHash = searchParams.get('tx') || '';
  const creatorWallet = searchParams.get('wallet') || '';

  return (
    <DeployingStateWithOrchestration
      orchestrationId={orchestrationId}
      transactionHash={transactionHash}
      creatorWallet={creatorWallet}
      error={error}
      onError={(msg) => setError(msg)}
    />
  );
}
