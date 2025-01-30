"use client";

import { memo, useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface PriceChangeProps {
  initialValue?: number;
  isLoading?: boolean;
  showIcon?: boolean;
  precision?: number;
  className?: string;
  hideZero?: boolean;
  variant?: "default" | "compact" | "icon-only";
}

interface PriceChangeState {
  value: number;
  isPositive: boolean;
  isZero: boolean;
}

const LoadingState = memo(({ className }: { className?: string }) => (
  <Skeleton className={cn("h-4 w-16", className)} />
));
LoadingState.displayName = "LoadingState";

const PriceIcon = memo(({ isPositive }: { isPositive: boolean }) =>
  isPositive ? (
    <ArrowUpIcon className="w-3 h-3 text-green-500" />
  ) : (
    <ArrowDownIcon className="w-3 h-3 text-red-500" />
  ),
);
PriceIcon.displayName = "PriceIcon";

const formatValue = (value: number, precision: number = 2) => {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    return `${(absValue / 1000).toFixed(1)}k`;
  }
  return absValue.toFixed(precision);
};

export const PriceChange = memo(
  ({
    initialValue,
    isLoading,
    showIcon = false,
    precision = 2,
    className,
    hideZero = true,
    variant = "default",
  }: PriceChangeProps) => {
    const [change, setChange] = useState<PriceChangeState>(() => {
      const value = initialValue ?? 0;
      return {
        value,
        isPositive: value >= 0,
        isZero: value === 0,
      };
    });

    useEffect(() => {
      if (initialValue !== undefined) {
        setChange({
          value: initialValue,
          isPositive: initialValue >= 0,
          isZero: initialValue === 0,
        });
        return;
      }

      // Only generate random values if no initial value provided
      const randomValue = Math.random() * 20;
      setChange({
        value: randomValue,
        isPositive: Math.random() > 0.5,
        isZero: randomValue === 0,
      });
    }, [initialValue]);

    const formattedValue = useMemo(
      () => formatValue(change.value, precision),
      [change.value, precision],
    );

    if (isLoading) {
      return <LoadingState className={className} />;
    }

    if (hideZero && change.isZero) {
      return null;
    }

    if (variant === "icon-only") {
      return <PriceIcon isPositive={change.isPositive} />;
    }

    const content =
      variant === "compact"
        ? formattedValue
        : `${change.isPositive ? "+" : "-"}${formattedValue}%`;

    return (
      <span
        className={cn(
          "font-mono inline-flex items-center gap-1",
          change.isPositive ? "text-green-500" : "text-red-500",
          className,
        )}
      >
        {showIcon && <PriceIcon isPositive={change.isPositive} />}
        <span className="text-xs">{content}</span>
      </span>
    );
  },
);
PriceChange.displayName = "PriceChange";
