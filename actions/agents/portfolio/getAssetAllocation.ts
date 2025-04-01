'use server';

import { AssetAllocation } from '@/lib/types';

/**
 * Fetches asset allocation data for a specific agent
 * Note: This is a placeholder implementation as the specific endpoint
 * for asset allocation is not specified in the API documentation.
 * This might need to be updated once the actual endpoint is available.
 */
export async function getAssetAllocation(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
    const apiKey = process.env.API_KEY || 'secret';
    
    // Assuming the endpoint might be something like /api/performance/{agentId}/assets
    const response = await fetch(`${apiUrl}/api/performance/${agentId}/assets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      next: { revalidate: 10 }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json() as AssetAllocation;
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error fetching asset allocation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 