'use server';

import { unstable_cache } from 'next/cache';
import {
  TokenSimulationResponse,
  BondingCurveResponse,
  CurrentPriceResponse,
  MarketCapResponse,
  PriceHistoryResponse,
  TokenMarketDataResponse,
  Agent,
} from '@/lib/types';
import { RpcProvider, Abi } from 'starknet';

// Initialize provider
const provider = new RpcProvider({
  nodeUrl:
    process.env.NODE_URL || 'https://starknet-sepolia.public.blastapi.io',
});

// Cache simulation results for 5 seconds
const getCachedSimulation = unstable_cache(
  async (agentId: string, tokenAmount: string, type: 'buy' | 'sell') => {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const response = await fetch(
      `${apiUrl}/api/agent-token/${agentId}/simulate-${type}?tokenAmount=${tokenAmount}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to simulate ${type}`);
    }

    const data = (await response.json()) as TokenSimulationResponse;

    // Convert BigInt to string for serialization
    return data.data.amount;
  },
  ['token-simulation'],
  { revalidate: 5, tags: ['token-simulation'] },
);

export async function simulateBuyTokens(agentId: string, tokenAmount: string) {
  try {
    const result = await getCachedSimulation(agentId, tokenAmount, 'buy');
    return {
      success: true,
      data: BigInt(result), // Convert back to BigInt after cache retrieval
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function simulateSellTokens(agentId: string, tokenAmount: string) {
  try {
    const result = await getCachedSimulation(agentId, tokenAmount, 'sell');
    return {
      success: true,
      data: BigInt(result), // Convert back to BigInt after cache retrieval
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getBondingCurvePercentage(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const response = await fetch(
      `${apiUrl}/api/agent-token/${agentId}/bonding-curve-percentage`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to get bonding curve percentage');
    }

    const data = (await response.json()) as BondingCurveResponse;
    return {
      success: true,
      data: data.data.percentage,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getTokenPriceHistory(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const response = await fetch(
      `${apiUrl}/api/agent-token/${agentId}/price-history`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Token not found for agent ${agentId}`);
      }
      throw new Error('Failed to fetch price history');
    }

    const data = (await response.json()) as PriceHistoryResponse;
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getCurrentPrice(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) throw new Error('Missing API configuration');

    const response = await fetch(
      `${apiUrl}/api/agent-token/${agentId}/current-price`,
      {
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to get current price');
    }

    const data = (await response.json()) as CurrentPriceResponse;

    return { success: true, data: data.data.price };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getMarketCap(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) throw new Error('Missing API configuration');

    const response = await fetch(
      `${apiUrl}/api/agent-token/${agentId}/market-cap`,
      {
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to get market cap');
    }

    const data = (await response.json()) as MarketCapResponse;

    return { success: true, data: data.data.marketCap };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getTokenMarketData(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) throw new Error('Missing API configuration');

    const response = await fetch(
      `${apiUrl}/api/agent-token/${agentId}/current-price`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        next: { revalidate: 60 }, // Cache for 1 minute since data updates every minute
      },
    );

    if (!response.ok) {
      throw new Error('Failed to get token market data');
    }

    const data = (await response.json()) as TokenMarketDataResponse;
    return { success: true, data: data.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getAgentAvatar(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) throw new Error('Missing API configuration');

    const response = await fetch(
      `${apiUrl}/api/eliza-agent/${agentId}/avatar`,
      {
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        next: { revalidate: 3600 }, // Cache for 1 hour since avatars rarely change
      },
    );

    if (!response.ok) {
      throw new Error('Failed to get agent avatar');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        url: data.url ? `${apiUrl}${data.url}` : null,
        contentType: data.contentType,
      },
    };
  } catch (error) {
    console.error('❌ Error fetching agent avatar:', {
      agentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Consolidated function to get all token and agent info
export async function getAgentInfo(agentId: string) {
  try {
    const [marketData, avatar] = await Promise.all([
      getTokenMarketData(agentId),
      getAgentAvatar(agentId),
    ]);

    return {
      success: true,
      data: {
        marketData: marketData.success ? marketData.data : null,
        profilePictureUrl:
          avatar.success && avatar.data?.url ? avatar.data.url : null,
      },
    };
  } catch (error) {
    console.error('❌ Error fetching agent info:', {
      agentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Get complete agent data including token info
export async function getCompleteAgentData(
  agentId: string,
): Promise<{ success: boolean; data?: Agent; error?: string }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) throw new Error('Missing API configuration');

    // Fetch all agent data in a single call
    const response = await fetch(`${apiUrl}/api/eliza-agent/${agentId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      next: { revalidate: 5 }, // Cache for 5 seconds
    });

    if (!response.ok) {
      throw new Error('Failed to get agent data');
    }

    const {
      data: { agent: apiAgent },
    } = await response.json();

    // Format token contract address
    const tokenAddress = apiAgent.Token?.contractAddress
      ? apiAgent.Token.contractAddress.startsWith('0x')
        ? apiAgent.Token.contractAddress
        : `0x${apiAgent.Token.contractAddress}`
      : '0x0';

    // Fetch contract ABI if we have a valid contract address
    let contractAbi: Abi = [];
    if (tokenAddress && tokenAddress !== '0x0') {
      try {
        const { abi } = await provider.getClassAt(tokenAddress);
        if (abi) {
          contractAbi = abi;
        } else {
          console.warn('⚠️ No ABI found for contract:', tokenAddress);
        }
      } catch (error) {
        console.error('❌ Error fetching ABI:', error);
      }
    }

    // Construct complete agent data from the comprehensive response
    const agent: Agent = {
      id: apiAgent.id,
      name: apiAgent.name,
      symbol:
        apiAgent.Token?.symbol || apiAgent.name.substring(0, 4).toUpperCase(),
      type: apiAgent.curveSide === 'LEFT' ? 'leftcurve' : 'rightcurve',
      status:
        apiAgent.LatestMarketData?.bondingStatus === 'BONDING'
          ? 'bonding'
          : 'live',
      price: apiAgent.LatestMarketData?.price || 0,
      marketCap: apiAgent.LatestMarketData?.marketCap || 0,
      holders: apiAgent.LatestMarketData?.holders || 0,
      creator: apiAgent.Wallet?.deployedAddress
        ? `0x${apiAgent.Wallet.deployedAddress}`
        : 'unknown',
      createdAt: apiAgent.createdAt,
      creativityIndex: apiAgent.degenScore || 0,
      performanceIndex: apiAgent.winScore || 0,
      contractAddress: tokenAddress as `0x${string}`,
      profilePictureUrl: apiAgent.profilePictureUrl
        ? `${apiUrl}${apiAgent.profilePictureUrl}`
        : undefined,
      abi: contractAbi,
      // Additional data that might be useful for components
      buyTax: apiAgent.Token?.buyTax,
      sellTax: apiAgent.Token?.sellTax,
      priceChange24h: apiAgent.LatestMarketData?.priceChange24h || 0,
      characterConfig: apiAgent.characterConfig,
    };

    return {
      success: true,
      data: agent,
    };
  } catch (error) {
    console.error('❌ Error fetching complete agent data:', {
      agentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
