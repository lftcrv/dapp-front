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
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trade } from '@/lib/types';

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

interface TradeItemProps {
  trade: Trade;
  isLatest?: boolean;
}

const TradeIcon = memo(({ type }: { type: 'buy' | 'sell' }) =>
  type === 'buy' ? (
    <ArrowUpRight className="w-4 h-4 text-green-500" />
  ) : (
    <ArrowDownRight className="w-4 h-4 text-red-500" />
  ),
);
TradeIcon.displayName = 'TradeIcon';

// General number formatting functions
const formatAmount = (amount: string | undefined): string => {
  if (!amount) return '0';
  try {
    const num = parseFloat(amount);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  } catch {
    return '0';
  }
};

const formatPrice = (price: number | undefined): string => {
  if (!price) return '0.00';
  try {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return '0.00';
  }
};

const TradeItem = memo(({ trade, isLatest }: TradeItemProps) => {
  const formattedTime = useMemo(() => {
    if (!trade?.time) return 'Just now';
    return formatTimeAgo(trade.time);
  }, [trade?.time]);

  const fullDate = useMemo(() => {
    if (!trade?.time) return 'Just now';
    return formatFullDate(trade.time);
  }, [trade?.time]);

  if (!trade?.information?.trade) {
    return null;
  }

  const tradeInfo = trade.information.trade;
  const {
    buyTokenName,
    sellTokenName,
    buyAmount,
    sellAmount,
    tradePriceUSD,
    explanation,
  } = tradeInfo;
  console.log("tradeInfo:", tradeInfo)

  if (!buyTokenName || !sellTokenName) {
    return null;
  }

  // Simplified buy/sell determination based on trade.type
  const isBuy = trade.type === 'buy';
  const colorClass = isBuy ? 'text-green-500' : 'text-red-500';
  const bgClass = isBuy
    ? 'bg-green-500/5 border-green-500/20'
    : 'bg-red-500/5 border-red-500/20';

  // Simplified display logic
  const displayAmount = isBuy
    ? formatAmount(buyAmount)
    : formatAmount(sellAmount);
  const otherAmount = !isBuy
    ? formatAmount(buyAmount)
    : formatAmount(sellAmount);
  const displayToken = isBuy ? buyTokenName : sellTokenName;
  const otherToken = !isBuy ? buyTokenName : sellTokenName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'flex flex-col space-y-1 rounded-lg border p-2 transition-colors',
        bgClass,
        isLatest && 'ring-2 ring-offset-2 ring-offset-background',
        isBuy ? 'ring-green-500/30' : 'ring-red-500/30',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TradeIcon type={isBuy ? 'buy' : 'sell'} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <span className={cn('text-sm font-medium', colorClass)}>
                    ${formatPrice(tradePriceUSD)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({displayAmount} {displayToken})
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-64 bg-white border shadow-xl z-50 relative">
                <div className="text-xs space-y-1 p-3 rounded-md">
                  <div className="font-medium border-b border-gray-100 pb-2 text-gray-900">
                    {isBuy ? 'Buying' : 'Selling'} {sellTokenName} for{' '}
                    {buyTokenName}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="text-gray-500">
                      Amount {isBuy ? 'In' : 'Out'}:
                    </div>
                    <div className="font-medium text-gray-900">
                      {displayAmount} {displayToken}
                    </div>
                    <div className="text-gray-500">
                      Amount {!isBuy ? 'In' : 'Out'}:
                    </div>
                    <div className="font-medium text-gray-900">
                      {otherAmount} {otherToken}
                    </div>
                    <div className="text-gray-500">Price:</div>
                    <div className="font-medium text-gray-900">
                      ${formatPrice(tradePriceUSD)}
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

    return new Date(b.time).getTime() - new Date(a.time).getTime();
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
