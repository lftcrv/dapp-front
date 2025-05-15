'use server';

import { Agent, AgentStatus, AgentType } from '@/lib/types';
import { Abi } from 'starknet';

// Define the API response type
interface CreatorPerformanceResponse {
  creatorId: string;
  totalAgents: number;
  runningAgents: number;
  totalTvl: number;
  totalBalanceInUSD: number;
  totalPnlCycle: number;
  totalPnl24h: number;
  totalTradeCount: number;
  bestPerformingAgentPnlCycle: {
    id: string;
    name: string;
    status: string;
    profilePictureUrl: string | null;
    createdAt: string;
    balanceInUSD: number;
    tvl: number;
    pnlCycle: number;
    pnl24h: number;
    tradeCount: number;
    marketCap: number;
    pnlRank: number;
    forkCount: number;
  };
  agentDetails: Array<{
    id: string;
    name: string;
    status: string;
    profilePictureUrl: string | null;
    createdAt: string;
    balanceInUSD: number;
    tvl: number;
    pnlCycle: number;
    pnl24h: number;
    tradeCount: number;
    marketCap: number;
    pnlRank: number;
    forkCount: number;
  }>;
  lastUpdated: string;
}

// Define transformed data types for our components
export interface CreatorPerformanceData {
  creatorStats: {
    totalAgents: number;
    runningAgents: number;
    totalPnl: number;
    totalTrades: number;
    bestAgent: Agent | null;
    totalPortfolioBalance: number;
  };
  agents: Agent[];
  creatorCardData: {
    id: string;
    totalPnl: number;
    agentCount: number;
    runningAgents: number;
    createdAt: string;
  };
}

export async function getCreatorPerformance(creatorId: string): Promise<{
  success: boolean;
  data?: CreatorPerformanceData;
  error?: string;
}> {
  try {
    const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (!backendApiUrl) {
      const errorMsg = 'NEXT_PUBLIC_BACKEND_API_URL environment variable is not set.';
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    const apiUrl = `${backendApiUrl}/api/creators/${creatorId}/performance`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'x-api-key': process.env.BACKEND_API_KEY || 'secret',
        'Accept': 'application/json',
      },
      cache: 'no-store', 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error for ${apiUrl}: ${response.status} - ${errorText}`);
      throw new Error(`API responded with status: ${response.status}. Body: ${errorText}`);
    }

    const apiData: CreatorPerformanceResponse = await response.json();

    // Transform the API data for the CreatorAgentTable component
    const mappedAgents: Agent[] = apiData.agentDetails.map(agent => ({
      id: agent.id,
      name: agent.name,
      // Map status from API to component format (use default 'live' if running, otherwise 'ended')
      status: agent.status === 'RUNNING' ? 'live' : 'ended',
      // Generate a symbol from the agent name
      symbol: agent.name?.substring(0, 3).toUpperCase() || 'AGT',
      // Default type as 'leftcurve' since we don't have this info
      type: 'leftcurve' as AgentType,
      // Use API data where available
      tvl: agent.balanceInUSD,
      pnlCycle: agent.pnlCycle,
      pnl24h: agent.pnl24h,
      tradeCount: agent.tradeCount,
      createdAt: agent.createdAt,
      // Set required fields with placeholder values
      price: 0,
      marketCap: agent.marketCap || 0,
      holders: 0,
      creator: creatorId,
      // Convert null to undefined for profilePictureUrl
      profilePictureUrl: agent.profilePictureUrl || undefined,
      // Required field for Agent type
      creativityIndex: 0,
      performanceIndex: 0,
      contractAddress: '0x0' as `0x${string}`,
      abi: [] as Abi,
    }));

    // Transform the data for the CreatorStatCards component
    const creatorStats = {
      totalAgents: apiData.totalAgents,
      runningAgents: apiData.runningAgents,
      totalPnl: apiData.totalPnlCycle,
      totalTrades: apiData.totalTradeCount,
      totalPortfolioBalance: apiData.totalBalanceInUSD,
      bestAgent: apiData.bestPerformingAgentPnlCycle ? {
        id: apiData.bestPerformingAgentPnlCycle.id,
        name: apiData.bestPerformingAgentPnlCycle.name,
        // Minimal required fields for Agent type
        symbol: apiData.bestPerformingAgentPnlCycle.name?.substring(0, 3).toUpperCase() || 'AGT',
        type: 'leftcurve' as AgentType,
        status: apiData.bestPerformingAgentPnlCycle.status === 'RUNNING' ? 'live' as AgentStatus : 'ended' as AgentStatus,
        price: 0,
        marketCap: apiData.bestPerformingAgentPnlCycle.marketCap || 0,
        holders: 0,
        creator: creatorId,
        createdAt: apiData.bestPerformingAgentPnlCycle.createdAt,
        pnlCycle: apiData.bestPerformingAgentPnlCycle.pnlCycle,
        tvl: apiData.bestPerformingAgentPnlCycle.balanceInUSD,
        creativityIndex: 0,
        performanceIndex: 0,
        contractAddress: '0x0' as `0x${string}`,
        abi: [] as Abi,
        // Convert null to undefined for profilePictureUrl
        profilePictureUrl: apiData.bestPerformingAgentPnlCycle.profilePictureUrl || undefined,
      } as Agent : null,
    };

    // Data for the CreatorCard component
    const creatorCardData = {
      id: apiData.creatorId,
      totalPnl: apiData.totalPnlCycle,
      agentCount: apiData.totalAgents,
      runningAgents: apiData.runningAgents,
      createdAt: apiData.lastUpdated,
    };

    const finalData = {
      creatorStats,
      agents: mappedAgents,
      creatorCardData,
    };

    return {
      success: true,
      data: finalData,
    };
  } catch (error) {
    console.error('Error in getCreatorPerformance for creatorId ', creatorId, ':', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during performance fetch',
    };
  }
} 