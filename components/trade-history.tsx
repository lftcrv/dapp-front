"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTrades } from "@/hooks/use-trades";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Trade } from "@/lib/types";
import { memo, useCallback, useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  History,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  trade: Trade;
  isLatest?: boolean;
}

const TradeIcon = memo(({ type }: { type: "buy" | "sell" }) =>
  type === "buy" ? (
    <ArrowUpRight className="w-4 h-4 text-green-500" />
  ) : (
    <ArrowDownRight className="w-4 h-4 text-red-500" />
  ),
);
TradeIcon.displayName = "TradeIcon";

const TradeItem = memo(({ trade, isLatest }: TradeItemProps) => {
  const isBuy = trade.type === "buy";
  const colorClass = isBuy ? "text-green-500" : "text-red-500";
  const bgClass = isBuy
    ? "bg-green-500/5 border-green-500/20"
    : "bg-red-500/5 border-red-500/20";
  const formattedTime = useMemo(() => formatTimeAgo(trade.time), [trade.time]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex flex-col space-y-1 rounded-lg border p-2 transition-colors",
        bgClass,
        isLatest && "ring-2 ring-offset-2 ring-offset-background",
        isBuy ? "ring-green-500/30" : "ring-red-500/30",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TradeIcon type={trade.type} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <span className={cn("text-sm font-medium", colorClass)}>
                    ${trade.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({trade.amount.toLocaleString()} tokens)
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Total Value: ${(trade.price * trade.amount).toLocaleString()}
                </p>
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
              <p>{new Date(trade.time).toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div
        className="text-xs text-muted-foreground leading-relaxed line-clamp-2"
        title={trade.summary}
      >
        {trade.summary}
      </div>
    </motion.div>
  );
});
TradeItem.displayName = "TradeItem";

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
LoadingState.displayName = "LoadingState";

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
LoadMoreButton.displayName = "LoadMoreButton";

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

const ErrorState = memo(({ error, onRetry }: ErrorStateProps) => (
  <Alert variant="destructive">
    <AlertDescription className="flex items-center justify-between">
      <span>{error.message || "Failed to load trade history"}</span>
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
ErrorState.displayName = "ErrorState";

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
EmptyState.displayName = "EmptyState";

interface TradeHistoryProps {
  agentId?: string;
  className?: string;
  maxHeight?: number;
}

export const TradeHistory = memo(
  ({ agentId, className, maxHeight = 500 }: TradeHistoryProps) => {
    const { trades, isLoading, error, hasMore, loadMore } = useTrades({
      agentId,
    });

    const handleLoadMore = useCallback(() => {
      loadMore();
    }, [loadMore]);

    if (isLoading && !trades.length) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} />;
    }

    return (
      <div
        className={cn(
          "space-y-2 overflow-auto scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20 pr-2",
          className,
        )}
        style={{ maxHeight }}
      >
        <AnimatePresence mode="popLayout">
          {trades.length > 0 ? (
            trades.map((trade: Trade, index: number) => (
              <TradeItem key={trade.id} trade={trade} isLatest={index === 0} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EmptyState />
            </motion.div>
          )}
        </AnimatePresence>

        {hasMore && trades.length > 0 && (
          <LoadMoreButton
            onClick={handleLoadMore}
            isLoading={isLoading}
            remainingCount={trades.length}
          />
        )}
      </div>
    );
  },
);
TradeHistory.displayName = "TradeHistory";
