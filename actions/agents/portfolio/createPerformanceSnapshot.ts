'use server';

import { callApi } from './api-utils';
import { PerformanceSnapshot } from '@/lib/types/portfolio';

/**
 * Creates a new performance snapshot for an agent
 * This is typically triggered by a cron job, but can be manually triggered as well
 */
export async function createPerformanceSnapshot(agentId: string) {
  try {
    const response = await callApi<PerformanceSnapshot>(
      `/api/performance/${agentId}`,
      'POST'
    );

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Error creating performance snapshot:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 