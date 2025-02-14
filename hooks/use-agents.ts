'use client';

import { useEffect } from 'react';
import { Agent } from '@/lib/types';
import { agentService } from '@/lib/services/api/agents';
import { useAsyncState } from '@/lib/core/state';
import { getCompleteAgentData } from '@/actions/agents/token/getTokenInfo';

export function useAgents() {
  const state = useAsyncState<Agent[]>();

  async function fetchAgents() {
    state.setLoading(true);
    const result = await agentService.getAll();
    state.handleResult(result);
  }

  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    ...state,
    refetch: fetchAgents,
  };
}

export function useAgent({
  id,
  initialData,
}: {
  id: string;
  initialData?: Agent;
}) {
  const state = useAsyncState<Agent>(initialData);
  const { setLoading, handleResult } = state;

  useEffect(() => {
    async function fetchAgent() {
      if (initialData) return;

      setLoading(true);
      const result = await getCompleteAgentData(id);
      if (!result.success && result.error) {
        handleResult({ 
          success: false, 
          error: new Error(result.error),
          data: undefined 
        });
      } else {
        handleResult(result as { success: true; data: Agent });
      }
    }

    fetchAgent();
  }, [id, initialData, setLoading, handleResult]);

  return state;
}
