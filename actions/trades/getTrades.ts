'use server';
import {
  Trade,
  TradeType,
  ApiTrade,
  GetTradesResponse,
  MarketOrderTradeInfo,
  LimitOrderTradeInfo,
  CancelOrderTradeInfo,
} from '@/lib/types';

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

    // Parse the response only once
    const result = (await response.json()) as GetTradesResponse;

    // Check if trades exist in the expected structure
    const trades = result.data?.trades || [];

    return {
      success: true,
      data: trades.map((trade: ApiTrade) => {
        // Common trade properties
        const commonTrade = {
          id: trade.id,
          agentId: trade.elizaAgentId,
          time: trade.time || trade.createdAt || new Date().toISOString(),
          success: true,
          txHash: '',
        };

        // Check if information exists
        if (!trade.information) {
          return {
            ...commonTrade,
            type: 'unknown' as TradeType,
            summary: 'No trade information available',
          };
        }

        // Determine the trade type based on the information structure
        if ('tradeType' in trade.information) {
          // Handle Paradex trades
          if (trade.information.tradeType === 'paradexPlaceOrderMarket') {
            const info = trade.information as MarketOrderTradeInfo;
            return {
              ...commonTrade,
              type: info.trade.side === 'BUY' ? 'buy' : ('sell' as TradeType),
              amount: parseFloat(info.trade.size),
              price: 'MARKET PRICE',
              summary:
                info.trade.explanation ||
                `${info.trade.side} ${info.trade.size} ${info.trade.market} at MARKET PRICE`,
              txHash: info.tradeId || '',
              information: trade.information,
            };
          } else if (trade.information.tradeType === 'paradexPlaceOrderLimit') {
            const info = trade.information as LimitOrderTradeInfo;
            return {
              ...commonTrade,
              type: info.trade.side === 'BUY' ? 'buy' : ('sell' as TradeType),
              amount: parseFloat(info.trade.size),
              price: parseFloat(info.trade.price),
              summary:
                info.trade.explanation ||
                `${info.trade.side} ${info.trade.size} ${info.trade.market} at ${info.trade.price}`,
              txHash: info.tradeId || '',
              information: trade.information,
            };
          } else if (trade.information.tradeType === 'paradexCancelOrder') {
            const info = trade.information as CancelOrderTradeInfo;
            return {
              ...commonTrade,
              type: 'cancel' as TradeType,
              summary: info.explanation || `Cancelled order ${info.tradeId}`,
              txHash: info.tradeId || '',
              information: trade.information,
            };
          }
        }
        // Legacy format handling
        else if (trade.information.trade) {
          const legacyInfo = trade.information;
          return {
            ...commonTrade,
            type:
              legacyInfo.trade.sellTokenName === 'USDT'
                ? 'sell'
                : ('buy' as TradeType),
            amount: parseFloat(legacyInfo.trade.buyAmount || '0'),
            price: legacyInfo.trade.tradePriceUSD,
            summary: legacyInfo.trade.explanation || '',
            txHash: legacyInfo.tradeId || '',
            information: trade.information,
          };
        }
        // Default case for unknown formats
        return {
          ...commonTrade,
          type: 'unknown' as TradeType,
          summary: 'Unknown trade format',
          information: trade.information,
        };
      }) as Trade[],
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
