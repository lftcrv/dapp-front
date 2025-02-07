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
  const startTime = Date.now();
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    console.log(`[Server] 🔄 Fetching trades ${agentId ? `for agent ${agentId}` : 'all'}`);

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const endpoint = agentId
      ? `${apiUrl}/api/trading-information/${agentId}`
      : `${apiUrl}/api/trading-information`;

    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      // Add caching for 5 seconds
      next: { revalidate: 5 },
    });

    const data = await response.json();
    const tradeCount = Array.isArray(data) ? data.length : (data.trades || []).length;
    const duration = Date.now() - startTime;
    console.log(`[Server] ✅ Found ${tradeCount} trades (${duration}ms)`);

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 404) {
        console.warn(`[Server] ⚠️ No trades found for agent: ${agentId}`);
        throw new Error('No trades found');
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later');
      }
      throw new Error(data.message || 'Failed to fetch trades');
    }

    // Handle both array response and object with trades property
    const trades = Array.isArray(data) ? data : data.trades || [];

    return {
      success: true,
      data: trades.map((trade: ApiTrade) => ({
        ...trade,
        type: trade.type as TradeType,
      })) as Trade[],
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Server] ❌ Error (${duration}ms):`, error instanceof Error ? error.message : error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
