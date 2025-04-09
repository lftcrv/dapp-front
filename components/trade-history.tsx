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

function isCancelOrder(info: any): info is CancelOrderTradeInfo {
  return info && info.tradeType === 'paradexCancelOrder';
}

// Define the interface for objects with a trade property
interface TradeInfoWithTrade {
  trade: any;
  tradeId: string;
  containerId?: string;
}

// Type predicate to narrow down the type
function hasTradeProperty(info: any): info is TradeInfoWithTrade {
  return info && 'trade' in info;
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

  // Default values
  let buyTokenName = 'Unknown';
  let sellTokenName = 'Unknown';
  let buyAmount = '0';
  let sellAmount = '0';
  let tradePriceUSD = trade.price || 0;

  // Check if the simulateTrade format with fromToken/toToken format
  if (
    info &&
    'trade' in info &&
    'fromToken' in info.trade &&
    'toToken' in info.trade &&
    'fromAmount' in info.trade &&
    'toAmount' in info.trade
  ) {
    const tradeInfo = info.trade;
    const fromToken = tradeInfo.fromToken as string;
    const toToken = tradeInfo.toToken as string;
    const fromAmount = tradeInfo.fromAmount as string | number;
    const toAmount = tradeInfo.toAmount as string | number;

    if (fromToken === 'USDC') {
      // Buying crypto with USDC
      buyTokenName = toToken;
      sellTokenName = fromToken;
      buyAmount = String(toAmount);
      sellAmount = String(fromAmount);
      if ('price' in tradeInfo) {
        tradePriceUSD = parseFloat(String(tradeInfo.price)) || tradePriceUSD;
      }
      return {
        buyTokenName,
        sellTokenName,
        buyAmount,
        sellAmount,
        tradePriceUSD,
      };
    } else if (toToken === 'USDC') {
      // Selling crypto for USDC
      buyTokenName = fromToken;
      sellTokenName = toToken;
      buyAmount = String(fromAmount);
      sellAmount = String(toAmount);
      if ('price' in tradeInfo) {
        tradePriceUSD = parseFloat(String(tradeInfo.price)) || tradePriceUSD;
      }
      return {
        buyTokenName,
        sellTokenName,
        buyAmount,
        sellAmount,
        tradePriceUSD,
      };
    } else {
      // Crypto to crypto swap
      buyTokenName = toToken;
      sellTokenName = fromToken;
      buyAmount = String(toAmount);
      sellAmount = String(fromAmount);
      if ('price' in tradeInfo) {
        tradePriceUSD = parseFloat(String(tradeInfo.price)) || tradePriceUSD;
      }
      return {
        buyTokenName,
        sellTokenName,
        buyAmount,
        sellAmount,
        tradePriceUSD,
      };
    }
  }

  // Check if the trade info has a trade property and narrow the type
  if (hasTradeProperty(info)) {
    const tradeInfo = info.trade;

    // If we have buyTokenName and sellTokenName directly (legacy format)
    if ('buyTokenName' in tradeInfo && 'sellTokenName' in tradeInfo) {
      buyTokenName = tradeInfo.buyTokenName;
      sellTokenName = tradeInfo.sellTokenName;
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
        tradePriceUSD = parseFloat(tradeInfo.price) || tradePriceUSD;
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

  // Handle cancel orders
  if (trade.type === 'cancel') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'flex flex-col space-y-1 rounded-lg border p-2 transition-colors',
          'bg-amber-500/5 border-amber-500/20',
          isLatest &&
            'ring-2 ring-offset-2 ring-offset-background ring-amber-500/30',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TradeIcon type="cancel" />
            <span className="text-sm font-medium text-amber-600">
              Cancel Order
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[10px] text-muted-foreground cursor-help">
                  {formattedTime}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-white border shadow-xl z-50 relative">
                <div className="p-3 rounded-md">
                  <p className="text-xs font-medium text-gray-900">
                    {fullDate}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div
          className="text-xs text-muted-foreground leading-relaxed"
          title={explanation}
        >
          {explanation}
        </div>
      </motion.div>
    );
  }

  // For buy/sell trades (including unknown type with valid token data), extract data
  const displayData = getTradeDisplayData(trade);
  if (!displayData) {
    // If we couldn't extract any meaningful display data at all, show unknown trade
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'flex flex-col space-y-1 rounded-lg border p-2 transition-colors',
          'bg-gray-500/5 border-gray-500/20',
          isLatest &&
            'ring-2 ring-offset-2 ring-offset-background ring-gray-500/30',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TradeIcon type="unknown" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col cursor-help">
                    <span className="text-sm font-medium text-gray-500">
                      Unknown Trade
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Transaction details unavailable
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-64 bg-white border shadow-xl z-50 relative">
                  <div className="text-xs space-y-1 p-3 rounded-md">
                    <div className="font-medium border-b border-gray-100 pb-2 text-gray-900">
                      Transaction Details
                    </div>
                    <div className="pt-2 text-gray-600">
                      <p>This transaction cannot be parsed into a standard trade format.</p>
                      <p className="mt-1">Check the explanation below for more details.</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[10px] text-muted-foreground cursor-help">
                  {formattedTime}
                </span>
              </TooltipTrigger>
              <TooltipContent className="bg-white border shadow-xl z-50 relative">
                <div className="p-3 rounded-md">
                  <p className="text-xs font-medium text-gray-900">
                    {fullDate}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div
          className="text-xs text-muted-foreground leading-relaxed line-clamp-2"
          title={explanation}
        >
          {explanation}
        </div>
      </motion.div>
    );
  }

  const { buyTokenName, sellTokenName, buyAmount, sellAmount, tradePriceUSD } =
    displayData;

  // Instead of determining if it's buy or sell, we'll focus on what was received vs spent
  const receivedToken = buyTokenName;
  const receivedAmount = buyAmount;
  const spentToken = sellTokenName;
  const spentAmount = sellAmount;
  
  // For coloring, we'll use a more sophisticated financial UI color scheme
  const isBuy = trade.type === 'buy' || 
    (buyTokenName !== 'Unknown' && sellTokenName === 'USDC');
  
  const colorClass = isBuy ? 'text-blue-600' : 'text-purple-600';
  const bgClass = isBuy
    ? 'bg-blue-500/5 border-blue-500/20'
    : 'bg-purple-500/5 border-purple-500/20';

  // Format amounts with appropriate decimal places based on token type
  const displayReceived = formatAmount(receivedAmount, receivedToken);
  const displaySpent = formatAmount(spentAmount, spentToken);

  // Create a more informative title that focuses on the exchange
  const tradeTitle = `${displayReceived} ${receivedToken}`;
  
  // Create action text that shows what was spent
  const actionText = `for ${displaySpent} ${spentToken}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'flex flex-col space-y-1 rounded-lg border p-2 transition-colors',
        bgClass,
        isLatest && 'ring-2 ring-offset-2 ring-offset-background',
        isBuy ? 'ring-blue-500/30' : 'ring-purple-500/30',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TradeIcon type={isBuy ? 'buy' : 'sell'} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col cursor-help">
                  <div className="flex items-center gap-1">
                    <span className={cn('text-sm font-medium', colorClass)}>
                      {tradeTitle}
                    </span>
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-800">
                      {isBuy ? 'Acquired' : 'Traded'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {actionText}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-64 bg-white border shadow-lg z-50 relative">
                <div className="text-xs space-y-1 p-3 rounded-md">
                  <div className="font-medium border-b border-gray-100 pb-2 text-gray-900">
                    Trade Details
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="text-gray-500">
                      You received:
                    </div>
                    <div className="font-medium text-gray-900">
                      {displayReceived} {receivedToken}
                    </div>
                    <div className="text-gray-500">
                      You traded:
                    </div>
                    <div className="font-medium text-gray-900">
                      {displaySpent} {spentToken}
                    </div>
                    <div className="text-gray-500">Price:</div>
                    <div className="font-medium text-gray-900">
                      {typeof tradePriceUSD === 'string'
                        ? tradePriceUSD
                        : `$${formatPrice(tradePriceUSD)}`}
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[10px] text-muted-foreground cursor-help">
                {formattedTime}
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-white border shadow-xl z-50 relative">
              <div className="p-3 rounded-md">
                <p className="text-xs font-medium text-gray-900">{fullDate}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div
        className="text-xs text-muted-foreground leading-relaxed line-clamp-2"
        title={explanation}
      >
        {explanation}
      </div>
    </motion.div>
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
