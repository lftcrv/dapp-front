'use server';

import { callApi } from '../api-utils';
import { AgentTradeCount } from '@/lib/types/metrics';

/**
 * Fetches the trade count for a specific agent
 */
export async function getAgentTradeCount(agentId: string) {
  try {
    const response = await callApi<AgentTradeCount>(
      `/api/metrics/agent/${agentId}/trades`,
      'GET'
    );

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error(`Error fetching trade count for agent ${agentId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 