'use server';

import { Trade, TradeType } from '@/lib/types';

interface ApiTrade {
  id: string;
  agentId: string;
  type: string;
  amount: number;
  price: number;
  time: string;
  summary: string;
  txHash: string;
  success: boolean;
}

export async function getTrades(agentId?: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    console.log('Fetching trades with config:', {
      apiUrl,
      hasApiKey: !!apiKey,
      agentId,
    });

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const endpoint = agentId
      ? `${apiUrl}/api/trading-information/${agentId}`
      : `${apiUrl}/api/trading-information`;

    console.log('Making request to:', endpoint);

    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      // Add caching for 5 seconds
      next: { revalidate: 5 },
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        console.error('API Key error:', {
          status: response.status,
          data,
          headers: Object.fromEntries(response.headers.entries()),
        });
        throw new Error('Invalid API key');
      } else if (response.status === 404) {
        console.warn('No trades found for agent:', agentId);
        throw new Error('No trades found');
      } else if (response.status >= 500) {
        console.error('Server error:', {
          status: response.status,
          data,
          headers: Object.fromEntries(response.headers.entries()),
        });
        throw new Error('Server error - please try again later');
      }
      throw new Error(data.message || 'Failed to fetch trades');
    }

    // Handle both array response and object with trades property
    const trades = Array.isArray(data) ? data : data.trades || [];
    console.log('Parsed trades:', trades);

    return {
      success: true,
      data: trades.map((trade: ApiTrade) => ({
        ...trade,
        type: trade.type as TradeType,
      })) as Trade[],
    };
  } catch (error) {
    console.error('Error fetching trades:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
