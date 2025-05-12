'use server';

import { callApi } from './api-utils';

// Agent data type from API
export interface Agent {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

// Define a return type for better error handling
interface GetCreatorAgentsResult {
  success: boolean;
  data?: Agent[];
  error?: string;
}

/**
 * Server action to fetch agents for a specific creator
 * This keeps the API key secure by only using it server-side
 */
export async function getCreatorAgents(creatorId: string): Promise<GetCreatorAgentsResult> {
  try {
    const result = await callApi<{ data: Agent[] }>(`/api/creators/${creatorId}/agents`, 'GET');
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error fetching creator agents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
} 