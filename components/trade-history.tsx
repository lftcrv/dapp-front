'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { memo, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  History,
  XCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trade, TradeType, CancelOrderTradeInfo } from '@/lib/types';

// Simplified date handling
const formatTimeAgo = (isoString: string | undefined): string => {
  if (!isoString) return 'Just now';

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Just now';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // For future dates or very recent trades (last few seconds)
    if (diffMs < 1000) return 'Just now';

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffMonth / 12);

    // Return the most appropriate time difference
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWeek < 4) return `${diffWeek}w ago`;
    if (diffMonth < 12) return `${diffMonth}mo ago`;
    return `${diffYear}y ago`;
  } catch {
    return 'Just now';
  }
};

const formatFullDate = (isoString: string | undefined): string => {
  if (!isoString) return 'Just now';

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Just now';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(date);
  } catch {
    return 'Just now';
  }
};

interface PotentialCancelOrderInfo {
  tradeType?: string;
}

function isCancelOrder(info: unknown): info is CancelOrderTradeInfo {
  return (
    info !== null &&
    typeof info === 'object' &&
    'tradeType' in info &&
    (info as PotentialCancelOrderInfo).tradeType === 'paradexCancelOrder'
  );
}

// Define a basic trade object structure
interface BaseTradeObject {
  // Common properties that might exist
  explanation?: string;

  // Properties for token swap format
  fromToken?: string;
  toToken?: string;
  fromAmount?: string | number;
  toAmount?: string | number;
  price?: string | number;

  // Properties for legacy format
  buyTokenName?: string;
  sellTokenName?: string;
  buyAmount?: string;
  sellAmount?: string;
  tradePriceUSD?: number;

  // Properties for market/limit orders
  market?: string;
  side?: 'BUY' | 'SELL';
  size?: string;

  // Allow for other properties
  [key: string]: unknown;
}

// Define the interface for objects with a trade property
interface TradeInfoWithTrade {
  trade: BaseTradeObject;
  tradeId: string;
  containerId?: string;
}

// Type predicate to narrow down the type
function hasTradeProperty(info: unknown): info is TradeInfoWithTrade {
  return Boolean(
    info &&
      typeof info === 'object' &&
      'trade' in info &&
      info.trade !== null &&
      typeof info.trade === 'object',
  );
}

interface TradeItemProps {
  trade: Trade;
  isLatest?: boolean;
}

const TradeIcon = memo(({ type }: { type: TradeType }) => {
  switch (type) {
    case 'buy':
      return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
    case 'sell':
      return <ArrowDownRight className="w-4 h-4 text-purple-600" />;
    case 'cancel':
      return <XCircle className="w-4 h-4 text-amber-600" />;
    case 'noTrade':
      return <Clock className="w-4 h-4 text-gray-600" />;
    default:
      return <HelpCircle className="w-4 h-4 text-gray-500" />;
  }
});
TradeIcon.displayName = 'TradeIcon';

// Update number formatting functions to handle asset-specific decimal places
const formatAmount = (amount: string | undefined, token: string): string => {
  if (!amount) return '0';
  try {
    const num = parseFloat(amount);
    // Different precision for different assets
    if (token === 'BTC') {
      // BTC typically uses 8 decimal places max, but display 4-6 for UI
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: num < 0.001 ? 6 : num < 0.1 ? 4 : 4,
      });
    } else if (token === 'ETH') {
      // ETH typically displays 4 decimal places
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: num < 0.001 ? 6 : num < 0.1 ? 4 : 2,
      });
    } else if (token === 'USDC') {
      // USDC should display 0-2 decimal places
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }
    // Default formatting
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  } catch {
    return '0';
  }
};

// Updated formatPrice to handle both number and string values
const formatPrice = (price: number | string | undefined): string => {
  if (price === undefined || price === null) return '0';

  // If price is already a string (like 'MARKET PRICE'), return it directly
  if (typeof price === 'string') {
    return price;
  }

  // Otherwise format the number
  try {
    // Format price with appropriate number of decimal places based on value
    if (price > 10000) {
      // For high prices (BTC), show 0 decimals
      return price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    } else if (price > 100) {
      // For medium prices, show 2 decimals
      return price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    } else {
      // For low prices, show more decimals
      return price.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      });
    }
  } catch {
    return '0';
  }
};

// Extract explanation safely based on trade type
function getExplanation(trade: Trade): string {
  if (!trade.information) return trade.summary || '';

  const info = trade.information;

  if (isCancelOrder(info)) {
    return info.explanation || trade.summary || 'Order cancelled';
  }

  if (hasTradeProperty(info)) {
    const tradeInfo = info.trade;
    if ('explanation' in tradeInfo) {
      return tradeInfo.explanation || trade.summary || '';
    }
  }

  return trade.summary || '';
}

// Get display data for buy/sell trades
function getTradeDisplayData(trade: Trade) {
  const info = trade.information;
  if (!info) return null;

  // Check for noTrade in information object if it exists
  const isNoTrade =
    trade.type === 'noTrade' ||
    (info &&
      typeof info === 'object' &&
      'tradeType' in info &&
      (info as { tradeType?: string }).tradeType === 'noTrade');

  // Handle noTrade events specifically
  if (isNoTrade) {
    let action = 'Wait';
    let explanation = '';

    // Try to extract information from the trade object
    if (
      hasTradeProperty(info) &&
      typeof info.trade === 'object' &&
      'action' in info.trade
    ) {
      action = String(info.trade.action) || 'Wait';
      explanation = info.trade.explanation || '';
    }

    return {
      buyTokenName: 'N/A',
      sellTokenName: 'N/A',
      buyAmount: 'N/A',
      sellAmount: 'N/A',
      tradePriceUSD: 0,
      isNoTrade: true,
      isSimulated: false,
      action,
      explanation,
    };
  }

  // Check for simulateTrade in information object if it exists
  const isSimulated =
    trade.type === 'simulateTrade' ||
    (info &&
      typeof info === 'object' &&
      'tradeType' in info &&
      (info as { tradeType?: string }).tradeType === 'simulateTrade');

  // Default values
  let buyTokenName = 'Unknown';
  let sellTokenName = 'Unknown';
  let buyAmount = '0';
  let sellAmount = '0';
  let tradePriceUSD = trade.price || 0;

  // Check if the simulateTrade format with fromToken/toToken format
  if (
    info &&
    hasTradeProperty(info) &&
    typeof info.trade === 'object' &&
    'fromToken' in info.trade &&
    'toToken' in info.trade &&
    'fromAmount' in info.trade &&
    'toAmount' in info.trade
  ) {
    const tradeInfo = info.trade;
    const fromToken = tradeInfo.fromToken as string;
    const toToken = tradeInfo.toToken as string;
    const fromAmount = String(tradeInfo.fromAmount);
    const toAmount = String(tradeInfo.toAmount);

    if (fromToken === 'USDC') {
      // Buying crypto with USDC
      buyTokenName = toToken;
      sellTokenName = fromToken;
      buyAmount = toAmount;
      sellAmount = fromAmount;
      if ('price' in tradeInfo) {
        tradePriceUSD = parseFloat(String(tradeInfo.price)) || tradePriceUSD;
      }
      return {
        buyTokenName,
        sellTokenName,
        buyAmount,
        sellAmount,
        tradePriceUSD,
        isNoTrade: false,
        isSimulated,
      };
    } else if (toToken === 'USDC') {
      // Selling crypto for USDC
      buyTokenName = fromToken;
      sellTokenName = toToken;
      buyAmount = fromAmount;
      sellAmount = toAmount;
      if ('price' in tradeInfo) {
        tradePriceUSD = parseFloat(String(tradeInfo.price)) || tradePriceUSD;
      }
      return {
        buyTokenName,
        sellTokenName,
        buyAmount,
        sellAmount,
        tradePriceUSD,
        isNoTrade: false,
        isSimulated,
      };
    } else {
      // Crypto to crypto swap
      buyTokenName = toToken;
      sellTokenName = fromToken;
      buyAmount = toAmount;
      sellAmount = fromAmount;
      if ('price' in tradeInfo) {
        tradePriceUSD = parseFloat(String(tradeInfo.price)) || tradePriceUSD;
      }
      return {
        buyTokenName,
        sellTokenName,
        buyAmount,
        sellAmount,
        tradePriceUSD,
        isNoTrade: false,
        isSimulated,
      };
    }
  }

  // Check if the trade info has a trade property and narrow the type
  if (hasTradeProperty(info)) {
    const tradeInfo = info.trade;

    // If we have buyTokenName and sellTokenName directly (legacy format)
    if ('buyTokenName' in tradeInfo && 'sellTokenName' in tradeInfo) {
      buyTokenName = tradeInfo.buyTokenName ?? 'Unknown';
      sellTokenName = tradeInfo.sellTokenName ?? 'Unknown';
      buyAmount = tradeInfo.buyAmount || '0';
      sellAmount = tradeInfo.sellAmount || '0';
      tradePriceUSD = tradeInfo.tradePriceUSD || tradePriceUSD;
    }
    // For market/limit orders, extract from market field
    else if ('market' in tradeInfo && 'side' in tradeInfo) {
      const [baseToken, quoteToken] = (tradeInfo.market || '').split('-');
      const isBuy = tradeInfo.side === 'BUY';

      buyTokenName = isBuy ? baseToken || 'Unknown' : quoteToken || 'USD';
      sellTokenName = isBuy ? quoteToken || 'USD' : baseToken || 'Unknown';
      buyAmount = isBuy ? tradeInfo.size || '0' : '0';
      sellAmount = isBuy ? '0' : tradeInfo.size || '0';

      if ('price' in tradeInfo && tradeInfo.price) {
        tradePriceUSD = parseFloat(String(tradeInfo.price)) || tradePriceUSD;
      }
    }
  }

  return { buyTokenName, sellTokenName, buyAmount, sellAmount, tradePriceUSD };
}

const TradeItem = memo(({ trade, isLatest }: TradeItemProps) => {
  const formattedTime = useMemo(() => {
    if (!trade?.time) return 'Just now';
    return formatTimeAgo(trade.time);
  }, [trade?.time]);

  const fullDate = useMemo(() => {
    if (!trade?.time) return 'Just now';
    return formatFullDate(trade.time);
  }, [trade?.time]);

  // Get explanation
  const explanation = getExplanation(trade);

  // Check if this is a simulated trade
  const isSimulated = trade.type === 'simulateTrade' || 
    (trade.information && 
     typeof trade.information === 'object' && 
     'tradeType' in trade.information && 
     (trade.information as { tradeType?: string }).tradeType === 'simulateTrade');
  
  // Check for noTrade
  const isNoTrade = trade.type === 'noTrade' || 
    (trade.information && 
     typeof trade.information === 'object' && 
     'tradeType' in trade.information && 
     (trade.information as { tradeType?: string }).tradeType === 'noTrade');

  // Check if this is an actual trade (not a no-trade, cancel, or unknown)
  const isActualTrade = !isNoTrade && trade.type !== 'cancel' && trade.type !== 'unknown';

  // Determine action label and details based on trade type
  let tradeTitle = 'Unknown';
  let tradeSubtitle = '';
  let tradePriceDisplay = null;
  let cardClasses = 'bg-gray-500/5 border-gray-500/20';
  let iconType: TradeType = 'unknown';
  let titleColor = 'text-gray-600';
  let tooltipTitle = 'Trade Details';
  let actionType = '';
  let tradeBadge = null;
  
  // For tooltip trade details
  let fromToken = 'Unknown';
  let toToken = 'Unknown';
  let fromAmount = 'N/A';
  let toAmount = 'N/A';
  
  // Handle cancel orders
  if (trade.type === 'cancel') {
    tradeTitle = 'Cancel Order';
    iconType = 'cancel';
    cardClasses = 'bg-amber-500/5 border-amber-500/20';
    titleColor = 'text-amber-600';
    tooltipTitle = 'Cancel Order Details';
  } 
  // Handle noTrade events
  else if (isNoTrade) {
    let action = 'Wait';
    // Extract action if available
    if (trade.information && 
        hasTradeProperty(trade.information) && 
        typeof trade.information.trade === 'object' && 
        'action' in trade.information.trade) {
      action = String(trade.information.trade.action) || 'Wait';
    }
    
    tradeTitle = `Decision: ${action}`;
    tradeSubtitle = 'No trade executed';
    iconType = 'noTrade';
    tooltipTitle = 'No Trade Details';
    actionType = 'wait';
  } 
  // Handle regular/simulated trades
  else {
    const displayData = getTradeDisplayData(trade);
    
    if (displayData) {
      const { buyTokenName, sellTokenName, buyAmount, sellAmount, tradePriceUSD } = displayData;
      
      // Instead of determining if it's buy or sell, we'll focus on what was received vs spent
      const receivedToken = buyTokenName;
      const receivedAmount = buyAmount;
      const spentToken = sellTokenName;
      const spentAmount = sellAmount;
      
      // Set from/to tokens for tooltip
      fromToken = spentToken;
      toToken = receivedToken;
      fromAmount = spentAmount === 'N/A' ? 'N/A' : formatAmount(spentAmount, spentToken);
      toAmount = receivedAmount === 'N/A' ? 'N/A' : formatAmount(receivedAmount, receivedToken);
      
      // For coloring, we'll use a more sophisticated financial UI color scheme
      const isBuy =
        trade.type === 'buy' ||
        (buyTokenName !== 'Unknown' && sellTokenName === 'USDC');
      
      iconType = isBuy ? 'buy' : 'sell';
      cardClasses = isBuy
        ? 'bg-blue-500/5 border-blue-500/20'
        : 'bg-purple-500/5 border-purple-500/20';
      titleColor = isBuy ? 'text-blue-600' : 'text-purple-600';
      actionType = isBuy ? 'buy' : 'sell';
      
      // Format amounts with appropriate decimal places based on token type
      const displayReceived = formatAmount(receivedAmount, receivedToken);
      const displaySpent = formatAmount(spentAmount, spentToken);
      
      // Price display if available
      if (tradePriceUSD) {
        tradePriceDisplay = typeof tradePriceUSD === 'string'
          ? tradePriceUSD
          : `$${formatPrice(tradePriceUSD)}`;
      }
      
      // Create a more informative title that focuses on the exchange
      tradeTitle = `${displayReceived} ${receivedToken}`;
      tradeSubtitle = `for ${displaySpent} ${spentToken}`;
      tooltipTitle = isSimulated ? "Simulated Trade Details" : "Trade Details";
      
      // Create trade badge - different for simulated vs real trades
      tradeBadge = (
        <span className={cn(
          "inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-medium",
          isSimulated 
            ? "bg-blue-100 text-blue-800" 
            : (isBuy ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800")
        )}>
          {isSimulated ? 'Simulation' : (isBuy ? 'Acquired' : 'Sold')}
        </span>
      );
    } else {
      // Unknown trade with no displayable data
      tradeTitle = 'Unknown Trade';
      tradeSubtitle = 'Transaction details unavailable';
      tooltipTitle = 'Transaction Details';
    }
  }

  // Determine highlight ring color
  let ringColor = 'ring-gray-500/30';
  if (cardClasses.includes('amber')) {
    ringColor = 'ring-amber-500/30';
  } else if (cardClasses.includes('blue')) {
    ringColor = 'ring-blue-500/30';
  } else if (cardClasses.includes('purple')) {
    ringColor = 'ring-purple-500/30';
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'flex flex-col space-y-1 rounded-lg border p-2 transition-colors cursor-help relative',
              cardClasses,
              isLatest && `ring-2 ring-offset-2 ring-offset-background ${ringColor}`,
            )}
          >
            {/* Enhanced trade header with more information */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TradeIcon type={iconType} />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn('text-sm font-medium', titleColor)}>
                      {tradeTitle}
                    </span>
                    {tradeBadge}
                  </div>
                  {tradeSubtitle && (
                    <span className="text-xs text-muted-foreground">
                      {tradeSubtitle}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground">
                  {formattedTime}
                </span>
                {tradePriceDisplay && (
                  <span className="text-xs font-medium text-gray-600">
                    {tradePriceDisplay}
                  </span>
                )}
              </div>
            </div>
            
            {/* Show explanation with appropriate styling */}
            <div
              className={cn(
                "text-xs text-muted-foreground leading-relaxed",
                isActualTrade ? "line-clamp-2" : "line-clamp-3"
              )}
            >
              {explanation}
            </div>
            
            {/* Add extra information for actual trades */}
            {isActualTrade && !isNoTrade && (
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {actionType === 'buy' && (
                    <div className="text-[10px] flex items-center text-blue-600 font-medium">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      Buy
                    </div>
                  )}
                  {actionType === 'sell' && (
                    <div className="text-[10px] flex items-center text-purple-600 font-medium">
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                      Sell
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="w-64 bg-white border shadow-xl z-50 relative">
          <div className="text-xs space-y-1 p-3 rounded-md">
            <div className="font-medium border-b border-gray-100 pb-2 text-gray-900">
              {tooltipTitle}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {/* Trade pair for actual trades */}
              {isActualTrade && (
                <>
                  <div className="text-gray-500">From:</div>
                  <div className="font-medium text-gray-900">{fromAmount} {fromToken}</div>
                  <div className="text-gray-500">To:</div>
                  <div className="font-medium text-gray-900">{toAmount} {toToken}</div>
                </>
              )}
              
              {/* Action field for noTrade */}
              {isNoTrade && trade.information && 
               hasTradeProperty(trade.information) && 
               typeof trade.information.trade === 'object' && 
               'action' in trade.information.trade && (
                <>
                  <div className="text-gray-500">Action:</div>
                  <div className="font-medium text-gray-900">
                    {String(trade.information.trade.action) || 'Wait'}
                  </div>
                </>
              )}
              
              {/* Price field - for trades */}
              {tradePriceDisplay && (
                <>
                  <div className="text-gray-500">Price:</div>
                  <div className="font-medium text-gray-900">
                    {tradePriceDisplay}
                  </div>
                </>
              )}
              
              {/* Simulation indicator */}
              {isSimulated && (
                <>
                  <div className="text-gray-500">Type:</div>
                  <div className="font-medium text-blue-700">Simulation</div>
                </>
              )}
              
              {/* Time field - for all types */}
              <div className="text-gray-500">Time:</div>
              <div className="font-medium text-gray-900">{fullDate}</div>
              
              {/* Explanation field - for all types */}
              <div className="text-gray-500 col-span-2">Explanation:</div>
              <div className="font-medium text-gray-900 col-span-2 break-words">{explanation || 'No explanation provided'}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
TradeItem.displayName = 'TradeItem';

const LoadingState = memo(() => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex flex-col space-y-2 rounded-lg border p-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ))}
  </div>
));
LoadingState.displayName = 'LoadingState';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  remainingCount?: number;
}

const LoadMoreButton = memo(
  ({ onClick, isLoading, remainingCount }: LoadMoreButtonProps) => (
    <div className="mt-4 text-center">
      <Button
        onClick={onClick}
        disabled={isLoading}
        variant="outline"
        className="w-full group"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <RefreshCcw className="w-4 h-4 animate-spin" />
            Loading more...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Load more {remainingCount && `(${remainingCount} remaining)`}
          </span>
        )}
      </Button>
    </div>
  ),
);
LoadMoreButton.displayName = 'LoadMoreButton';

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

const ErrorState = memo(({ error, onRetry }: ErrorStateProps) => (
  <Alert variant="destructive">
    <AlertDescription className="flex items-center justify-between">
      <span>{error.message || 'Failed to load trade history'}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-7 px-2 text-xs"
        >
          <RefreshCcw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      )}
    </AlertDescription>
  </Alert>
));
ErrorState.displayName = 'ErrorState';

const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
    <div className="rounded-full bg-muted/10 p-3">
      <History className="w-6 h-6 text-muted-foreground" />
    </div>
    <h3 className="font-medium text-muted-foreground">No trades yet</h3>
    <p className="text-sm text-muted-foreground/60">
      This agent hasn&apos;t made any trades yet. Check back soon!
    </p>
  </div>
));
EmptyState.displayName = 'EmptyState';

interface TradeHistoryProps {
  trades: Trade[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function TradeHistory({
  trades,
  isLoading,
  onLoadMore,
  hasMore,
}: TradeHistoryProps) {
  if (isLoading) return <LoadingState />;
  if (!trades?.length) return <EmptyState />;

  // Sort by ISO string (which is chronologically sortable)
  const sortedTrades = [...trades].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1; // Move items without dates to the end
    if (!b.time) return -1;

    try {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    } catch {
      return 0;
    }
  });

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {sortedTrades.map((trade, index) => (
          <TradeItem key={trade.id} trade={trade} isLatest={index === 0} />
        ))}
      </AnimatePresence>

      {hasMore && onLoadMore && (
        <LoadMoreButton onClick={onLoadMore} isLoading={isLoading} />
      )}
    </div>
  );
}
