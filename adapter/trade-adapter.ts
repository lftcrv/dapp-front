import {
  Trade,
  TradeType,
  MarketOrderTradeInfo,
  LimitOrderTradeInfo,
  CancelOrderTradeInfo,
  LegacyTradeInfo,
} from '@/lib/types';

// Type guards for each kind of trade information
function isMarketOrder(info: any): info is MarketOrderTradeInfo {
  return info?.tradeType === 'paradexPlaceOrderMarket';
}

function isLimitOrder(info: any): info is LimitOrderTradeInfo {
  return info?.tradeType === 'paradexPlaceOrderLimit';
}

function isCancelOrder(info: any): info is CancelOrderTradeInfo {
  return info?.tradeType === 'paradexCancelOrder';
}

function isLegacyTrade(info: any): boolean {
  return info?.trade && 'buyTokenName' in info.trade;
}

export function adaptTradeData(trades: Trade[]): Trade[] {
  if (!trades || !Array.isArray(trades)) return [];

  return trades.map((trade) => {
    if (!trade?.information) return trade;

    const info = trade.information;
    let result: Trade = { ...trade };

    // Market Order
    if (isMarketOrder(info)) {
      const { market, side, size, explanation } = info.trade;
      const [baseToken, quoteToken] = (market || '').split('-');
      const isBuy = side === 'BUY';

      // Create a modified version of the trade information
      const modifiedInfo = {
        ...info,
        trade: {
          ...info.trade,
          // These fields are added for UI display purposes
          buyTokenName: isBuy ? baseToken : quoteToken,
          sellTokenName: isBuy ? quoteToken : baseToken,
          buyAmount: isBuy ? size : '0',
          sellAmount: isBuy ? '0' : size,
          tradePriceUSD: 'MARKET PRICE',
        },
      };

      // Update the trade with modified information and correct type
      result = {
        ...trade,
        type: isBuy ? 'buy' : 'sell',
        price: 'MARKET PRICE',
        information: modifiedInfo as MarketOrderTradeInfo,
      };
    }
    // Limit Order
    else if (isLimitOrder(info)) {
      const { market, side, size, price, explanation } = info.trade;
      const [baseToken, quoteToken] = (market || '').split('-');
      const isBuy = side === 'BUY';

      // Create a modified version of the trade information
      const modifiedInfo = {
        ...info,
        trade: {
          ...info.trade,
          // These fields are added for UI display purposes
          buyTokenName: isBuy ? baseToken : quoteToken,
          sellTokenName: isBuy ? quoteToken : baseToken,
          buyAmount: isBuy ? size : '0',
          sellAmount: isBuy ? '0' : size,
          tradePriceUSD: parseFloat(price) || trade.price || 0,
        },
      };

      // Update the trade with modified information and correct type
      result = {
        ...trade,
        type: isBuy ? 'buy' : 'sell',
        information: modifiedInfo as LimitOrderTradeInfo,
      };
    }
    // Cancel Order
    else if (isCancelOrder(info)) {
      // For cancel orders, we don't add a trade property as it would violate the type
      // Instead, we just update the type to 'cancel'
      result = {
        ...trade,
        type: 'cancel',
      };
    }
    // Legacy Trade (already has the right format)
    else if (isLegacyTrade(info)) {
      const tradeInfo = info.trade as LegacyTradeInfo;
      const isBuy = tradeInfo.buyAmount && parseFloat(tradeInfo.buyAmount) > 0;
      result = {
        ...trade,
        type: isBuy ? 'buy' : 'sell',
      };
    }
    // Unknown format - leave as is but mark as unknown type
    else {
      result = {
        ...trade,
        type: 'unknown',
      };
    }

    return result;
  });
}
