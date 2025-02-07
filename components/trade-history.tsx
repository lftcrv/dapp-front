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

interface TradeInfo {
  buyAmount: string;
  sellAmount: string;
  explanation: string;
  buyTokenName: string;
  sellTokenName: string;
  tradePriceUSD: number;
  buyTokenAddress: string;
  sellTokenAddress: string;
}

interface APITrade {
  id: string;
  createdAt: string;
  information: {
    trade: TradeInfo;
    tradeId: string;
    containerId: string;
  };
  elizaAgentId: string;
}

const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

interface TradeItemProps {
  trade: APITrade;
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

// Update token decimals handling
const TOKEN_DECIMALS: { [key: string]: number } = {
  'USDT': 6,
  'STRK': 18,
  'ETH': 18,
  // Add more tokens here
};

// Helper function to get token decimals with default
const getTokenDecimals = (tokenName: string): number => {
  // Default to 18 decimals (most common in ERC20 tokens)
  return TOKEN_DECIMALS[tokenName] ?? 18;
};

// Helper function to determine if token is a stablecoin
const isStableCoin = (tokenName: string): boolean => {
  return ['USDT', 'USDC', 'DAI', 'USDC'].includes(tokenName);
};

const TradeItem = memo(({ trade, isLatest }: TradeItemProps) => {
  const formattedTime = useMemo(() => formatTimeAgo(trade.createdAt), [trade.createdAt]);

  if (!trade?.information?.trade) {
    return null;
  }

  const tradeInfo = trade.information.trade;
  const { buyTokenName, sellTokenName, buyAmount, sellAmount, tradePriceUSD, explanation } = tradeInfo;

  if (!buyTokenName || !sellTokenName) {
    return null;
  }

  const isBuy = buyTokenName === 'USDT';
  const colorClass = isBuy ? 'text-green-500' : 'text-red-500';
  const bgClass = isBuy
    ? 'bg-green-500/5 border-green-500/20'
    : 'bg-red-500/5 border-red-500/20';

  const formatAmount = (amount: string | undefined, tokenName: string) => {
    if (!amount) return '0';
    try {
      const decimals = getTokenDecimals(tokenName);
      const num = parseFloat(amount) / Math.pow(10, decimals);
      
      // Use 2 decimals for stablecoins, 6 for others
      const maxDecimals = isStableCoin(tokenName) ? 2 : 6;
      return num.toLocaleString(undefined, { 
        minimumFractionDigits: 2,
        maximumFractionDigits: maxDecimals
      });
    } catch {
      return '0';
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return '0.00';
    try {
      return price.toLocaleString(undefined, { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      });
    } catch {
      return '0.00';
    }
  };

  const getChangeIndicator = (explanation: string) => {
    const match = explanation.match(/-?\d+%/);
    return match ? match[0] : '';
  };

  const changePercentage = getChangeIndicator(explanation);
  const displayAmount = isBuy ? 
    formatAmount(buyAmount, buyTokenName) : 
    formatAmount(sellAmount, sellTokenName);
  const otherAmount = !isBuy ? 
    formatAmount(buyAmount, buyTokenName) : 
    formatAmount(sellAmount, sellTokenName);
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
                  {changePercentage && (
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full",
                      changePercentage.includes('-') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                    )}>
                      {changePercentage}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-64">
                <div className="text-xs space-y-1">
                  <div className="font-medium">
                    {isBuy ? 'Buying' : 'Selling'} {sellTokenName} for {buyTokenName}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>Amount {isBuy ? 'In' : 'Out'}:</div>
                    <div>{displayAmount} {displayToken}</div>
                    <div>Amount {!isBuy ? 'In' : 'Out'}:</div>
                    <div>{otherAmount} {otherToken}</div>
                    <div>Price:</div>
                    <div>${formatPrice(tradePriceUSD)}</div>
                    {changePercentage && (
                      <>
                        <div>Change:</div>
                        <div>{changePercentage}</div>
                      </>
                    )}
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
            <TooltipContent>
              <p>{new Date(trade.createdAt).toLocaleString()}</p>
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
  trades: APITrade[];
  isLoading: boolean;
}

export function TradeHistory({ trades, isLoading }: TradeHistoryProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!trades || !Array.isArray(trades)) {
    return <EmptyState />;
  }

  const validTrades = trades
    .filter(trade => 
      trade && 
      trade.id &&
      trade.information?.trade &&
      trade.information.trade.buyTokenName && 
      trade.information.trade.sellTokenName
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (!validTrades.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {validTrades.map((trade, index) => (
          <TradeItem 
            key={`${trade.id}-${index}`}
            trade={trade}
            isLatest={index === 0} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
