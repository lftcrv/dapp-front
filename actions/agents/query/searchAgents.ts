'use server';

import { Agent } from '@/lib/types';

export interface SearchAgentsParams {
  query: string;
  type?: 'leftcurve' | 'rightcurve';
  status?: 'live' | 'bonding' | 'ended';
  limit?: number;
  offset?: number;
}

export async function searchAgents(params: SearchAgentsParams) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      q: params.query,
      ...(params.type && { type: params.type }),
      ...(params.status && { status: params.status }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    const response = await fetch(
      `${apiUrl}/api/eliza-agent/search?${queryParams}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later');
      }
      throw new Error(data.message || 'Failed to search agents');
    }

    // Map response data to include new fields
    const mappedAgents = data.agents.map((agent: any) => ({
      ...agent,
      // Ensure new fields are included
      pnlCycle: agent.LatestMarketData?.pnlCycle || 0,
      pnl24h: agent.LatestMarketData?.pnl24h || 0,
      tradeCount: agent.LatestMarketData?.tradeCount || 0,
      tvl: agent.LatestMarketData?.balanceInUSD || 0,
      cycleRanking: agent.LatestMarketData?.pnlRank || 0,
      forkerCount: agent.LatestMarketData?.forkCount || 0,
      priceChange24h: agent.LatestMarketData?.priceChange24h || 0
    }));

    return {
      success: true,
      data: {
        agents: mappedAgents as Agent[],
        total: data.total as number,
        hasMore: data.hasMore as boolean,
      },
    };
  } catch (error) {
    console.error('Error searching agents:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
