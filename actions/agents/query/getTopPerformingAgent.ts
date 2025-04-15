'use server';

import { Agent, ApiAgent } from '@/lib/types';
import { mapApiAgentToAgent } from './getAgents';

/**
 * Gets the top performing agent by PnL rank
 * Similar to:
 * curl -X GET "http://127.0.0.1:8080/api/eliza-agent" -H "x-api-key: secret" | \
 * jq '.data.agents[] | {id: .id, name: .name, pnlCycle: .LatestMarketData.pnlCycle, balanceInUSD: .LatestMarketData.balanceInUSD, pnlRank: .LatestMarketData.pnlRank}' | \
 * jq -s 'sort_by(.pnlRank) | .[0]'
 */
export async function getTopPerformingAgent() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    // Fetch all agents from the API
    const response = await fetch(`${apiUrl}/api/eliza-agent`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      next: { revalidate: 10 },
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later');
      }
      throw new Error(responseData.message || 'Failed to fetch agents');
    }

    // Check if we have the expected data structure
    if (!responseData.data?.agents || !Array.isArray(responseData.data.agents)) {
      console.error('Unexpected API response structure:', responseData);
      throw new Error('Invalid API response structure');
    }

    // Filter out agents without LatestMarketData or pnlRank
    const agentsWithPnlRank = responseData.data.agents.filter(
      (agent: ApiAgent) => 
        agent.LatestMarketData && 
        typeof agent.LatestMarketData.pnlRank === 'number' &&
        agent.LatestMarketData.pnlCycle !== undefined
    );

    if (agentsWithPnlRank.length === 0) {
      return {
        success: true,
        data: null,
        message: 'No agents with PnL data found'
      };
    }

    // Sort by PnL rank (lowest rank is best)
    agentsWithPnlRank.sort((a: ApiAgent, b: ApiAgent) => 
      (a.LatestMarketData?.pnlRank || Infinity) - (b.LatestMarketData?.pnlRank || Infinity)
    );

    // Get the top ranked agent
    const topAgent = agentsWithPnlRank[0];
    
    // Map to our agent model
    const mappedAgent = await mapApiAgentToAgent(topAgent);

    return {
      success: true,
      data: mappedAgent
    };
  } catch (error) {
    console.error('Error fetching top performing agent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
} 