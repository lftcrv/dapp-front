'use server';

import { AgentTradeCount } from '@/lib/types';

/**
 * Fetches the trade count for a specific agent using the performance history endpoint
 */
export async function getAgentTradeCount(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
    const apiKey = process.env.API_KEY || 'secret';

    // Use the performance history endpoint which we know contains trade count
    const response = await fetch(`${apiUrl}/api/performance/${agentId}/history?interval=daily&limit=1`, {
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

    const responseData = await response.json();
    
    // Extract trade count from the performance snapshots
    let tradeCount = 0;
    
    if (responseData.snapshots && responseData.snapshots.length > 0) {
      // Sort by timestamp to get the most recent snapshot
      const snapshots = [...responseData.snapshots];
      snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Get the trade count from the most recent snapshot
      tradeCount = snapshots[0].tradeCount || 0;
    }
    
    // Create the expected response format
    const data: AgentTradeCount = {
      agentId,
      name: '',  // We don't have the name from this endpoint
      tradeCount
    };
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error(`Error fetching trade count for agent ${agentId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
} 