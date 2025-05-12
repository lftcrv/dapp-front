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

// Define the interface for simple trade format
interface SimpleTradeInfo {
  tradeType: string;
  asset: string;
  price: number;
  amount: number;
  reasoning?: string;
  timestamp?: string;
  totalCost?: number;
}

// Type guard to check for simple trade format
function isSimpleTrade(info: unknown): info is SimpleTradeInfo {
  if (!info || typeof info !== 'object' || info === null) return false;

  const obj = info as Record<string, unknown>;

  return (
    'tradeType' in obj &&
    typeof obj.tradeType === 'string' &&
    'asset' in obj &&
    typeof obj.asset === 'string' &&
    'price' in obj &&
    (typeof obj.price === 'number' || typeof obj.price === 'string') &&
    'amount' in obj &&
    (typeof obj.amount === 'number' || typeof obj.amount === 'string')
  );
}

// Define the interface for simulate trade format
interface SimulateTradeInfo {
  fromToken: string;
  toToken: string;
  fromAmount: string | number;
  toAmount: string | number;
  price: string | number;
  explanation?: string;
}

// Type guard to check for simulate trade format
function isSimulateTradeInfo(info: unknown): info is SimulateTradeInfo {
  if (!info || typeof info !== 'object' || info === null) return false;

  const obj = info as Record<string, unknown>;

  return (
    'fromToken' in obj &&
    typeof obj.fromToken === 'string' &&
    'toToken' in obj &&
    typeof obj.toToken === 'string' &&
    'fromAmount' in obj &&
    (typeof obj.fromAmount === 'string' ||
      typeof obj.fromAmount === 'number') &&
    'toAmount' in obj &&
    (typeof obj.toAmount === 'string' || typeof obj.toAmount === 'number') &&
    'price' in obj &&
    (typeof obj.price === 'string' || typeof obj.price === 'number')
  );
}

export async function getTrades(agentId?: string) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY ;

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    const endpoint = agentId
      ? `${apiUrl}/api/trading-information/agent/${agentId}`
      : `${apiUrl}/api/trading-information`;

    console.log('Fetching trades from:', endpoint);
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      next: { revalidate: 5 },
    });

    // Handle HTTP errors with appropriate responses
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
    console.log('API response:', result);

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

        // If no information, return unknown trade
        if (!trade.information) {
          return {
            ...commonTrade,
            type: 'unknown' as TradeType,
            summary: 'No trade information available',
          };
        }

        // Handle different trade formats in order of priority

        // 1. Simple trade format (new API format)
        if (isSimpleTrade(trade.information)) {
          const info = trade.information;
          const tradeType =
            info.tradeType.toUpperCase() === 'BUY' ? 'buy' : 'sell';

          return {
            ...commonTrade,
            type: tradeType as TradeType,
            asset: info.asset,
            amount: Number(info.amount),
            price: Number(info.price),
            summary:
              info.reasoning ||
              `${tradeType.toUpperCase()} ${info.amount} ${info.asset} at $${
                info.price
              }`,
            information: trade.information,
          };
        }

        // 2. Paradex trades
        if ('tradeType' in trade.information) {
          const tradeType = trade.information.tradeType;

          // Market orders
          if (tradeType === 'paradexPlaceOrderMarket') {
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
          }

          // Limit orders
          if (tradeType === 'paradexPlaceOrderLimit') {
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
          }

          // Cancel orders
          if (tradeType === 'paradexCancelOrder') {
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

        // 3. Legacy format with trade property
        if ('trade' in trade.information) {
          const legacyInfo = trade.information;

          // Simulate trade format
          if ('tradeType' in trade && trade.tradeType === 'simulateTrade') {
            const tradeInfo = legacyInfo.trade;

            if (isSimulateTradeInfo(tradeInfo)) {
              // Determine trade type based on tokens
              let tradeType: TradeType = 'buy';
              let assetName = '';
              let amount = 0;
              let price = 0;

              if (tradeInfo.fromToken === 'USDC') {
                // Buying crypto with USDC
                tradeType = 'buy';
                assetName = tradeInfo.toToken;
                amount = parseFloat(String(tradeInfo.toAmount) || '0');
                price = parseFloat(String(tradeInfo.price) || '0');
              } else if (tradeInfo.toToken === 'USDC') {
                // Selling crypto for USDC
                tradeType = 'sell';
                assetName = tradeInfo.fromToken;
                amount = parseFloat(String(tradeInfo.fromAmount) || '0');
                price = parseFloat(String(tradeInfo.price) || '0');
              } else {
                // Crypto to crypto swap
                tradeType = 'sell';
                assetName = tradeInfo.fromToken;
                amount = parseFloat(String(tradeInfo.fromAmount) || '0');
                price = parseFloat(String(tradeInfo.price) || '0');
              }

              return {
                ...commonTrade,
                type: tradeType,
                asset: assetName,
                amount: amount,
                price: price,
                summary:
                  tradeInfo.explanation ||
                  `${
                    tradeType === 'buy' ? 'Buy' : 'Sell'
                  } ${amount} ${assetName} at $${price}`,
                information: trade.information,
              };
            }
          }

          // Other legacy formats
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

        // 4. Root level tradeType (without nested trade info)
        if ('tradeType' in trade && trade.tradeType === 'simulateTrade') {
          // Extract values with safe fallbacks
          const assetName =
            'asset' in trade && trade.asset ? String(trade.asset) : 'Unknown';
          const amount =
            'amount' in trade && trade.amount
              ? parseFloat(String(trade.amount) || '0')
              : 0;
          const price =
            'price' in trade && trade.price
              ? parseFloat(String(trade.price) || '0')
              : 0;
          const tradeSummary =
            'summary' in trade && trade.summary
              ? String(trade.summary)
              : `Trade for ${assetName}`;

          return {
            ...commonTrade,
            type: 'buy' as TradeType, // Default to buy
            asset: assetName,
            amount: amount,
            price: price,
            summary: tradeSummary,
            information: trade.information,
          };
        }

        // Default fallback for unknown formats
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
