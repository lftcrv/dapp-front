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
function isSimpleTrade(info: any): info is SimpleTradeInfo {
  return (
    info &&
    typeof info.tradeType === 'string' &&
    typeof info.asset === 'string' &&
    (typeof info.price === 'number' || typeof info.price === 'string') &&
    (typeof info.amount === 'number' || typeof info.amount === 'string')
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
function isSimulateTradeInfo(info: any): info is SimulateTradeInfo {
  return (
    info &&
    typeof info.fromToken === 'string' &&
    typeof info.toToken === 'string' &&
    (typeof info.fromAmount === 'string' || typeof info.fromAmount === 'number') &&
    (typeof info.toAmount === 'string' || typeof info.toAmount === 'number') &&
    (typeof info.price === 'string' || typeof info.price === 'number')
  );
}

export async function getTrades(agentId?: string) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
    const apiKey = process.env.API_KEY || 'secret';

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

        // Check if information exists
        if (!trade.information) {
          return {
            ...commonTrade,
            type: 'unknown' as TradeType,
            summary: 'No trade information available',
          };
        }

        // First check for simple trade format (new API format)
        if (isSimpleTrade(trade.information)) {
          const info = trade.information;
          const tradeType = info.tradeType.toUpperCase() === 'BUY' ? 'buy' : 'sell';
          
          return {
            ...commonTrade,
            type: tradeType as TradeType,
            asset: info.asset,
            amount: Number(info.amount),
            price: Number(info.price),
            summary: info.reasoning || `${tradeType.toUpperCase()} ${info.amount} ${info.asset} at $${info.price}`,
            information: trade.information,
          };
        }
        // Then check if it's a paradex trade with tradeType property
        else if ('tradeType' in trade.information) {
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
        // Legacy format check
        else if ('trade' in trade.information) {
          const legacyInfo = trade.information;
          
          // Handle the simulateTrade type (seen in the API response)
          if ('tradeType' in trade && trade.tradeType === 'simulateTrade') {
            // For simulateTrade, we need to determine buy/sell based on from/to tokens
            const tradeInfo = legacyInfo.trade;
            if (isSimulateTradeInfo(tradeInfo)) {
              // If converting from USDC to something else, it's a buy
              // If converting to USDC from something else, it's a sell
              // If converting between crypto assets, use standard convention:
              // - fromToken is what's being sold
              // - toToken is what's being bought
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
                // Crypto to crypto swap (treat as selling the fromToken)
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
                summary: tradeInfo.explanation || 
                  `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${amount} ${assetName} at $${price}`,
                information: trade.information,
              };
            }
          }
          
          // Handle other legacy format trades
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
        // Check for tradeType at the top level of the trade object
        else if ('tradeType' in trade && trade.tradeType === 'simulateTrade') {
          // If the trade has tradeType at root level but no nested trade info
          let assetName = 'Unknown';
          let amount = 0;
          let price = 0;
          let tradeSummary = 'Trade execution';
          
          // Safely check for properties
          if ('asset' in trade && trade.asset) {
            assetName = String(trade.asset);
          }
          
          if ('amount' in trade && trade.amount) {
            amount = parseFloat(String(trade.amount) || '0');
          }
          
          if ('price' in trade && trade.price) {
            price = parseFloat(String(trade.price) || '0');
          }
          
          if ('summary' in trade && trade.summary) {
            tradeSummary = String(trade.summary);
          } else {
            tradeSummary = `Trade for ${assetName}`;
          }
          
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
