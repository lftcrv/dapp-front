import { Trade, TradeType, CancelOrderTradeInfo } from '@/lib/types';

// Type guard to check if an object has the 'trade' property
function hasTrade(obj: any): boolean {
  return obj && 'trade' in obj;
}

// Type guard for cancel orders
function isCancelOrder(obj: any): obj is CancelOrderTradeInfo {
  return obj && obj.tradeType === 'paradexCancelOrder';
}

export function adaptTradeData(trades: Trade[]): Trade[] {
  if (!trades || !Array.isArray(trades)) return [];
  
  return trades.map(trade => {
    if (!trade?.information) return trade;
    
    // Handle cancel orders (which don't have a trade property)
    if (isCancelOrder(trade.information)) {
      return {
        ...trade,
        type: 'cancel' as TradeType,
        information: {
          ...trade.information,
          trade: {
            explanation: trade.information.explanation || trade.summary || 'Order cancelled',
            buyTokenName: 'Unknown',
            sellTokenName: 'Unknown',
            buyAmount: '0',
            sellAmount: '0',
            tradePriceUSD: 0
          }
        }
      };
    }
    
    // Skip if information doesn't have trade property
    if (!hasTrade(trade.information)) {
      return {
        ...trade,
        type: 'unknown' as TradeType,
        information: {
          ...trade.information,
          trade: {
            explanation: trade.summary || 'Unknown trade',
            buyTokenName: 'Unknown',
            sellTokenName: 'Unknown',
            buyAmount: '0',
            sellAmount: '0',
            tradePriceUSD: 0
          }
        }
      };
    }
    
    // Now we know trade.information.trade exists
    const tradeInfo = trade.information.trade;
    
    // Extract token info from market
    const marketParts = (tradeInfo.market || '').split('-');
    const baseToken = marketParts[0] || 'Unknown';
    const quoteToken = marketParts[1] || 'USD';
    
    // Determine if buy or sell
    const isBuy = tradeInfo.side ? 
      tradeInfo.side.toUpperCase() === 'BUY' : 
      trade.type === 'buy';
    
    return {
      ...trade,
      type: isBuy ? 'buy' : 'sell',
      information: {
        ...trade.information,
        trade: {
          ...tradeInfo,
          buyTokenName: isBuy ? baseToken : quoteToken,
          sellTokenName: isBuy ? quoteToken : baseToken,
          buyAmount: isBuy ? tradeInfo.size || "0" : "0",
          sellAmount: isBuy ? "0" : tradeInfo.size || "0",
          tradePriceUSD: parseFloat(tradeInfo.price) || trade.price || 0,
          explanation: tradeInfo.explanation || trade.summary || `${isBuy ? 'Buy' : 'Sell'} ${baseToken}`
        }
      }
    };
  });
}