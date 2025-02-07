'use client';

import { memo, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  createChart,
  ColorType,
  UTCTimestamp,
  IChartApi,
  CrosshairMode,
  SeriesDataItemTypeMap,
  Time,
} from 'lightweight-charts';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Rocket, LineChart } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { useBondingCurve } from '@/lib/bonding-curve-context';

type Interval = '15m' | '1h' | '4h' | '1d';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  data: CandleData[];
  symbol?: string;
  baseToken?: string;
  quoteToken?: string;
  inBondingCurve?: boolean;
  isLoading?: boolean;
  error?: Error | null;
}

const LoadingState = memo(() => (
  <div className="space-y-4">
    <div className="flex items-center justify-between px-2">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16" />
        ))}
      </div>
    </div>
    <Skeleton className="h-[400px] w-full" />
  </div>
));
LoadingState.displayName = 'LoadingState';

const ErrorState = memo(({ error }: { error: Error }) => (
  <Alert variant="destructive">
    <AlertDescription>
      Failed to load chart data: {error.message}
    </AlertDescription>
  </Alert>
));
ErrorState.displayName = 'ErrorState';

const ChartControls = memo(
  ({
    interval,
    setInterval,
    showMarketCap,
    setShowMarketCap,
    tradingPair,
    inBondingCurve,
    bondingPercentage,
  }: {
    interval: Interval;
    setInterval: (i: Interval) => void;
    showMarketCap: boolean;
    setShowMarketCap: (show: boolean) => void;
    tradingPair: string;
    inBondingCurve: boolean;
    bondingPercentage?: number;
  }) => (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-4">
        <div className="font-mono text-sm font-medium">{tradingPair}</div>
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMarketCap(!showMarketCap)}
            className={cn(
              'text-xs font-mono flex items-center gap-1.5',
              showMarketCap && 'bg-primary text-primary-foreground',
            )}
          >
            <LineChart className="h-3 w-3" />
            {showMarketCap ? 'MCAP' : 'PRICE'}
          </Button>
          <div className="flex items-center gap-2">
            {(['15m', '1h', '4h', '1d'] as const).map((i) => (
              <Button
                key={i}
                size="sm"
                variant={interval === i ? 'default' : 'outline'}
                onClick={() => setInterval(i)}
                className="text-xs font-mono"
              >
                {i.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {inBondingCurve && (
        <Badge variant="outline" className="font-mono text-xs">
          <Rocket className="mr-1 h-3 w-3" />
          Bonding Curve{' '}
          {bondingPercentage ? `(${bondingPercentage.toFixed(1)}%)` : ''}
        </Badge>
      )}
    </div>
  ),
);
ChartControls.displayName = 'ChartControls';

const formatLegend = (
  price: { time: Time; open: number; high: number; low: number; close: number },
  tradingPair: string,
  interval: string,
  showMarketCap: boolean,
) => {
  const formatValue = (value: number) => {
    if (showMarketCap) {
      return value >= 1000000
        ? `$${(value / 1000000).toFixed(2)}M`
        : `$${value.toFixed(2)}`;
    }
    return `$${value.toFixed(6)}`;
  };

  const date = new Date((price.time as number) * 1000);
  const timeStr =
    interval === '1d'
      ? date.toLocaleDateString()
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `
    <div class="font-mono text-xs">
      <div class="font-bold">${tradingPair} · ${timeStr}</div>
      <div class="grid grid-cols-2 gap-x-4 mt-1">
        <div>O: <span class="text-neutral-400">${formatValue(price.open)}</span></div>
        <div>H: <span class="text-neutral-400">${formatValue(price.high)}</span></div>
        <div>C: <span class="text-neutral-400">${formatValue(price.close)}</span></div>
        <div>L: <span class="text-neutral-400">${formatValue(price.low)}</span></div>
      </div>
    </div>
  `;
};

export const PriceChart = memo(
  ({
    data,
    symbol = '',
    baseToken = symbol,
    quoteToken = 'USDC',
    inBondingCurve = true,
    isLoading,
    error,
  }: PriceChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const legendRef = useRef<HTMLDivElement>(null);
    const [interval, setInterval] = useState<Interval>('15m');
    const [showMarketCap, setShowMarketCap] = useState(false);
    const tradingPair = `${baseToken}/${quoteToken}`;

    const { data: bondingCurveData } = useBondingCurve();
    const bondingPercentage = !bondingCurveData.isLoading
      ? bondingCurveData.percentage
      : null;

    const aggregateData = useCallback(
      (rawData: CandleData[], intervalType: Interval) => {
        if (intervalType === '15m') return rawData;

        const intervalMinutes =
          {
            '1h': 60,
            '4h': 240,
            '1d': 1440,
          }[intervalType] || 15;

        const groupedData = new Map<number, CandleData>();

        rawData.forEach((candle) => {
          const timestamp = candle.time;
          const intervalIndex =
            Math.floor(timestamp / (intervalMinutes * 60)) *
            (intervalMinutes * 60);

          if (!groupedData.has(intervalIndex)) {
            groupedData.set(intervalIndex, {
              time: intervalIndex,
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
              volume: candle.volume,
            });
          } else {
            const existing = groupedData.get(intervalIndex)!;
            existing.high = Math.max(existing.high, candle.high);
            existing.low = Math.min(existing.low, candle.low);
            existing.close = candle.close;
            existing.volume += candle.volume;
          }
        });

        return Array.from(groupedData.values());
      },
      [],
    );

    const chartData = useMemo(() => {
      // If we have historical data, use it
      if (data?.length) return aggregateData(data, interval);

      // Generate initial data points for bonding curve
      if (inBondingCurve && !bondingCurveData.isLoading) {
        const now = Math.floor(Date.now() / 1000);
        const initialPrice = 0.001; // Start with a small initial price

        // Create a simple line chart for initial state (ascending order)
        const dataPoints = [
          {
            time: (now - 3600) as UTCTimestamp, // 1 hour ago
            open: initialPrice,
            high: initialPrice,
            low: initialPrice,
            close: initialPrice,
            volume: 0,
          },
          {
            time: now as UTCTimestamp, // current time
            open: initialPrice,
            high: initialPrice,
            low: initialPrice,
            close: initialPrice,
            volume: 0,
          },
        ];

        return dataPoints;
      }

      return [];
    }, [data, interval, aggregateData, inBondingCurve, bondingCurveData]);

    useEffect(() => {
      if (!chartContainerRef.current) return;
      if (!chartData.length) return;

      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: {
            type: ColorType.Solid,
            color: 'transparent',
          },
          textColor: '#999',
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { visible: false },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderVisible: false,
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });

      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a50',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });

      const formattedData = chartData.map((d) => {
        const multiplier = showMarketCap ? 1000 : 1;
        return {
          time: d.time as UTCTimestamp,
          open: d.open * multiplier,
          high: d.high * multiplier,
          low: d.low * multiplier,
          close: d.close * multiplier,
        };
      });

      const volumeData = chartData.map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.volume,
        color: d.close > d.open ? '#22c55e44' : '#ef444444',
      }));

      candlestickSeries.setData(formattedData);
      volumeSeries.setData(volumeData);

      if (legendRef.current) {
        const legend = legendRef.current;
        chart.subscribeCrosshairMove((param) => {
          if (!param.time || param.point === undefined) {
            legend.innerHTML =
              formattedData.length > 0
                ? formatLegend(
                    formattedData[formattedData.length - 1],
                    tradingPair,
                    interval,
                    showMarketCap,
                  )
                : '';
            return;
          }

          const price = param.seriesData.get(
            candlestickSeries,
          ) as SeriesDataItemTypeMap['Candlestick'];
          if (price && 'open' in price) {
            legend.innerHTML = formatLegend(
              price,
              tradingPair,
              interval,
              showMarketCap,
            );
          }
        });

        if (formattedData.length > 0) {
          legend.innerHTML = formatLegend(
            formattedData[formattedData.length - 1],
            tradingPair,
            interval,
            showMarketCap,
          );
        }
      }

      chart.timeScale().fitContent();
      chartRef.current = chart;

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }, [chartData, interval, showMarketCap, tradingPair]);

    if (isLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} />;
    }

    return (
      <div className="space-y-2">
        <ChartControls
          interval={interval}
          setInterval={setInterval}
          showMarketCap={showMarketCap}
          setShowMarketCap={setShowMarketCap}
          tradingPair={tradingPair}
          inBondingCurve={inBondingCurve}
          bondingPercentage={bondingPercentage ?? undefined}
        />
        <div ref={chartContainerRef} />
        <div
          ref={legendRef}
          className="px-4 py-2 bg-card rounded-lg border text-card-foreground"
        />
      </div>
    );
  },
);
PriceChart.displayName = 'PriceChart';
