"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Performance } from "@/lib/types";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

type Trend = "up" | "down" | "neutral";
type FormatterFn = (value: number) => string;

interface StatItemProps {
  label: string;
  value: number;
  trend?: Trend;
  tooltipContent?: string;
  formatter?: FormatterFn;
}

const defaultFormatter: FormatterFn = (val: number) => val.toLocaleString();

const TrendIcon = memo(({ trend }: { trend: Trend }) => {
  const variants = {
    up: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 2 } },
    down: { y: [0, 2, 0], transition: { repeat: Infinity, duration: 2 } },
    neutral: {},
  };

  return (
    <motion.div variants={variants} animate={trend}>
      {trend === "up" ? (
        <ArrowUpIcon className="w-4 h-4 text-green-500" />
      ) : trend === "down" ? (
        <ArrowDownIcon className="w-4 h-4 text-red-500" />
      ) : (
        <MinusIcon className="w-4 h-4 text-muted-foreground" />
      )}
    </motion.div>
  );
});
TrendIcon.displayName = "TrendIcon";

const StatItem = memo(
  ({
    label,
    value,
    trend = "neutral",
    tooltipContent,
    formatter = defaultFormatter,
  }: StatItemProps) => {
    const trendColor = useMemo(
      () =>
        trend === "up"
          ? "text-green-500"
          : trend === "down"
            ? "text-red-500"
            : "text-muted-foreground",
      [trend],
    );

    const formattedValue = useMemo(() => formatter(value), [value, formatter]);

    const content = (
      <motion.div
        className="group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          {label}
          {trend !== "neutral" && <TrendIcon trend={trend} />}
        </div>
        <div
          className={cn(
            "text-2xl font-bold transition-colors",
            trendColor,
            "group-hover:opacity-90",
          )}
        >
          {formattedValue}
        </div>
      </motion.div>
    );

    if (tooltipContent) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  },
);
StatItem.displayName = "StatItem";

const LoadingState = memo(() => (
  <Card>
    <CardHeader>
      <Skeleton className="h-4 w-32" />
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
));
LoadingState.displayName = "LoadingState";

interface StatsGridProps {
  performance: Performance;
}

const formatters = {
  percentage: (value: number) => `${value.toFixed(1)}%`,
  score: (value: number) => value.toFixed(2),
  profitLoss: (value: number) => {
    const formatted = Math.abs(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${value >= 0 ? "+" : "-"}$${formatted}`;
  },
} as const;

const StatsGrid = memo(({ performance }: StatsGridProps) => {
  const getTrend = (value: number): Trend => {
    if (value > 0) return "up";
    if (value < 0) return "down";
    return "neutral";
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatItem
        label="Success Rate"
        value={performance.successRate}
        trend={getTrend(performance.successRate - 50)}
        tooltipContent="Percentage of profitable trades"
        formatter={formatters.percentage}
      />
      <StatItem
        label="Profit/Loss"
        value={performance.profitLoss}
        trend={getTrend(performance.profitLoss)}
        tooltipContent="Total profit or loss in USD"
        formatter={formatters.profitLoss}
      />
      <StatItem
        label="Trade Count"
        value={performance.tradeCount}
        tooltipContent="Total number of trades executed"
      />
      <StatItem
        label="Performance Score"
        value={performance.performanceScore}
        trend={getTrend(performance.performanceScore)}
        tooltipContent="Overall performance rating (0-100)"
        formatter={formatters.score}
      />
    </div>
  );
});
StatsGrid.displayName = "StatsGrid";

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

const ErrorState = memo(({ error, onRetry }: ErrorStateProps) => (
  <Alert variant="destructive">
    <AlertDescription className="flex items-center justify-between">
      <span>{error.message || "Failed to load agent stats"}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2"
        >
          Retry
        </button>
      )}
    </AlertDescription>
  </Alert>
));
ErrorState.displayName = "ErrorState";

interface AgentStatsProps {
  performance?: Performance;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

export const AgentStats = memo(
  ({ performance, isLoading, error, onRetry, className }: AgentStatsProps) => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} onRetry={onRetry} />;
    }

    if (!performance) {
      return null;
    }

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-mono">Performance Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <StatsGrid performance={performance} />
        </CardContent>
      </Card>
    );
  },
);
AgentStats.displayName = "AgentStats";
