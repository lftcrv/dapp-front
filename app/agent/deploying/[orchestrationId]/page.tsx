'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DeployingStateWithOrchestration } from '@/components/orchestration/deploying-state-orchestration';

interface DeployingPageProps {
  params: Promise<{ orchestrationId: string }>;
}

export default function DeployingPage({ params }: DeployingPageProps) {
  const [orchestrationId, setOrchestrationId] = useState('');
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const transactionHash = searchParams.get('tx') || '';
  const creatorWallet = searchParams.get('wallet') || '';

  useEffect(() => {
    const fetchOrchestrationId = async () => {
      const resolvedParams = await params;
      setOrchestrationId(resolvedParams.orchestrationId ?? '');
    };

    fetchOrchestrationId();
  }, [params]);

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
