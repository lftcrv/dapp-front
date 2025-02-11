'use server';

import { Agent, ApiAgent } from '@/lib/types';
import { RpcProvider } from 'starknet';
import { isInBondingPhase } from '@/lib/utils';

// Initialize provider
const provider = new RpcProvider({ 
  nodeUrl: process.env.NEXT_PUBLIC_NODE_URL 
});

async function mapApiAgentToAgent(apiAgent: ApiAgent): Promise<Agent> {
  // Format token contract address - ensure it starts with 0x but avoid double prefix
  const tokenAddress = apiAgent.Token?.contractAddress 
    ? apiAgent.Token.contractAddress.startsWith('0x') 
      ? apiAgent.Token.contractAddress 
      : `0x${apiAgent.Token.contractAddress}`
    : undefined;

  const price = apiAgent.LatestMarketData?.price || 0;
  const holders = apiAgent.LatestMarketData?.holders || 0;
  const isBonding = apiAgent.status !== 'RUNNING' || isInBondingPhase(price, holders);

  if (!tokenAddress) {
    return {
      id: apiAgent.id,
      name: apiAgent.name,
      symbol: apiAgent.name.substring(0, 4).toUpperCase(),
      type: apiAgent.curveSide === 'LEFT' ? 'leftcurve' : 'rightcurve',
      status: isBonding ? 'bonding' : 'live',
      price,
      marketCap: apiAgent.LatestMarketData?.marketCap || 0,
      holders,
      creator: apiAgent.Wallet?.deployedAddress ? `0x${apiAgent.Wallet.deployedAddress}` : 'unknown',
      createdAt: apiAgent.createdAt,
      creativityIndex: apiAgent.degenScore || 0,
      performanceIndex: apiAgent.winScore || 0,
      contractAddress: '0x0' as `0x${string}`,
      abi: []
    };
  }

  try {
    // Get the ABI from the token contract
    const { abi } = await provider.getClassAt(tokenAddress);
    if (!abi) {
      throw new Error('No ABI found for token contract');
    }

    return {
      id: apiAgent.id,
      name: apiAgent.name,
      symbol: apiAgent.name.substring(0, 4).toUpperCase(),
      type: apiAgent.curveSide === 'LEFT' ? 'leftcurve' : 'rightcurve',
      status: isBonding ? 'bonding' : 'live',
      price,
      marketCap: apiAgent.LatestMarketData?.marketCap || 0,
      holders,
      creator: apiAgent.Wallet?.deployedAddress ? `0x${apiAgent.Wallet.deployedAddress}` : 'unknown',
      createdAt: apiAgent.createdAt,
      creativityIndex: apiAgent.degenScore || 0,
      performanceIndex: apiAgent.winScore || 0,
      contractAddress: tokenAddress as `0x${string}`,
      abi
    };
  } catch (error) {
    console.error('Error fetching ABI for agent:', apiAgent.id, error);
    return {
      id: apiAgent.id,
      name: apiAgent.name,
      symbol: apiAgent.name.substring(0, 4).toUpperCase(),
      type: apiAgent.curveSide === 'LEFT' ? 'leftcurve' : 'rightcurve',
      status: isBonding ? 'bonding' : 'live',
      price,
      marketCap: apiAgent.LatestMarketData?.marketCap || 0,
      holders,
      creator: apiAgent.Wallet?.deployedAddress ? `0x${apiAgent.Wallet.deployedAddress}` : 'unknown',
      createdAt: apiAgent.createdAt,
      creativityIndex: apiAgent.degenScore || 0,
      performanceIndex: apiAgent.winScore || 0,
      contractAddress: tokenAddress as `0x${string}`,
      abi: []
    };
  }
}

export async function getAgents() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const response = await fetch(`${apiUrl}/api/eliza-agent`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      // Add caching for 10 seconds
      next: { revalidate: 10 },
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later');
      }
      throw new Error(responseData.message || 'Failed to fetch agents');
    }

    // Log the response to debug
    

    // Check if we have the expected data structure
    if (!responseData.data?.agents) {
      console.error('Unexpected API response structure:', responseData);
      throw new Error('Invalid API response structure');
    }

    // Map agents and wait for all promises to resolve
    const mappedAgents = await Promise.all(responseData.data.agents.map(mapApiAgentToAgent));

    return {
      success: true,
      data: mappedAgents,
    };
  } catch (error) {
    console.error('Error fetching agents:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getAgentById(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const response = await fetch(`${apiUrl}/api/eliza-agent/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      next: { revalidate: 5 },
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 404) {
        throw new Error('Agent not found');
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later');
      }
      throw new Error(responseData.message || 'Failed to fetch agent');
    }

    // Log the response to debug
    // console.log('API Response for agent:', id, JSON.stringify(responseData, null, 2));

    // Check if we have the expected data structure
    if (!responseData.data?.agent) {
      console.error('Unexpected API response structure:', responseData);
      throw new Error('Invalid API response structure');
    }

    const mappedAgent = await mapApiAgentToAgent(responseData.data.agent);

    return {
      success: true,
      data: mappedAgent,
    };
  } catch (error) {
    console.error('Error fetching agent:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
