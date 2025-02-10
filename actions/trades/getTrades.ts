'use server';

import { Trade, TradeType } from '@/lib/types';

interface ApiTrade {
  id: string;
  createdAt: string;
  information: {
    trade: {
      buyAmount: string;
      sellAmount: string;
      explanation: string;
      buyTokenName: string;
      sellTokenName: string;
      tradePriceUSD: number;
      buyTokenAddress: string;
      sellTokenAddress: string;
    };
    tradeId: string;
    containerId: string;
  };
  elizaAgentId: string;
}

interface ApiResponse {
  status: 'success' | 'error';
  data: {
    trades: ApiTrade[];
    trade?: ApiTrade;
  };
}

export async function getTrades(agentId?: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const endpoint = agentId 
      ? `${apiUrl}/api/trading-information/agent/${agentId}`
      : `${apiUrl}/api/trading-information`;

    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      next: { revalidate: 5 },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 404) {
        return { success: true, data: [] };
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later');
      }
      throw new Error('Failed to fetch trades');
    }

    const result = await response.json() as ApiResponse;
    const trades = result.data.trades || [];

    return {
      success: true,
      data: trades.map((trade) => ({
        id: trade.id,
        agentId: trade.elizaAgentId,
        type: trade.information.trade.sellTokenName === 'USDT' ? 'sell' : 'buy' as TradeType,
        amount: parseFloat(trade.information.trade.buyAmount),
        price: trade.information.trade.tradePriceUSD,
        time: trade.createdAt,
        summary: trade.information.trade.explanation,
        txHash: trade.information.tradeId,
        success: true,
        information: trade.information
      })) as Trade[],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
