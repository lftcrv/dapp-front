'use server';

import { unstable_cache } from 'next/cache';

interface TokenSimulationResponse {
  status: string;
  data: {
    amount: string;
  };
}

interface BondingCurveResponse {
  status: string;
  data: {
    percentage: number;
  };
}

interface CurrentPriceResponse {
  status: string;
  data: {
    price: string;
  };
}

interface MarketCapResponse {
  status: string;
  data: {
    marketCap: string;
  };
}

interface PriceHistoryResponse {
  status: string;
  data: {
    prices: {
      id: string;
      price: string;
      timestamp: string;
    }[];
    tokenSymbol: string;
    tokenAddress: string;
  };
}

// Cache simulation results for 5 seconds
const getCachedSimulation = unstable_cache(
  async (agentId: string, tokenAmount: string, type: 'buy' | 'sell') => {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }


    const startTime = Date.now();

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
  { revalidate: 5, tags: ['token-simulation'] }
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
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
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
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
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
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getCurrentPrice(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) throw new Error('Missing API configuration');


    const response = await fetch(`${apiUrl}/api/agent-token/${agentId}/current-price`, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    });

    if (!response.ok) {
      console.error(`[getCurrentPrice] Error response:`, {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error('Failed to get current price');
    }

    const data = (await response.json()) as CurrentPriceResponse;
    
    return { success: true, data: data.data.price };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function getMarketCap(agentId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) throw new Error('Missing API configuration');



    const response = await fetch(`${apiUrl}/api/agent-token/${agentId}/market-cap`, {
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    });

    if (!response.ok) {
      console.error(`[getMarketCap] Error response:`, {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error('Failed to get market cap');
    }

    const data = (await response.json()) as MarketCapResponse;
    

    
    return { success: true, data: data.data.marketCap };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
