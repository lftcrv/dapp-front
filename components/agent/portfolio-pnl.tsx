'use client';

import { memo, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, DollarSign, BarChart2, TrendingUp } from 'lucide-react';
import { cn, formatPnL, isPnLPositive } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// PnL Calculation modes
type PnLMode = 'daily' | 'cumulative';

// Time range options
type TimeRange = '1W' | '1M' | '3M' | 'ALL';

// Day scale options for data aggregation
type DayScale = '1D' | '1W' | '1M';

interface PnLData {
  total: number;
  percentage: number;
  monthly: Array<{
    date: string;
    value: number;
  }>;
}

interface PortfolioPnLProps {
  data: PnLData;
  agentId?: string;
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Get the first non-zero value (either positive or negative)
    const activePayload = payload.find((p: any) => p.value !== 0);
    if (!activePayload) return null;

    const value = activePayload.value;
    const isProfit = activePayload.dataKey === 'positive';

    return (
      <div className="bg-[#232229] p-3 rounded-lg shadow-lg border border-gray-700 text-white">
        <p className="font-mono text-sm font-semibold text-gray-300">{label}</p>
        <p
          className={cn(
            'font-mono text-lg flex items-center gap-1',
            isProfit ? 'text-green-400' : 'text-red-400',
          )}
        >
          {isProfit ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          $
          {Math.abs(value).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </p>
      </div>
    );
  }

  return null;
};

// Format date to display month and day
const formatDate = (dateStr: string, scale?: DayScale) => {
  const date = new Date(dateStr);
  
  if (!scale || scale === '1D') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (scale === '1W') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
};

// Generate an array of dates between start and end
const generateDatesBetween = (start: Date, end: Date): Date[] => {
  const dates = [];
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Aggregate data by day scale (daily, weekly, monthly)
const aggregateDataByScale = (data: any[], scale: DayScale): any[] => {
  if (!data || data.length === 0) return [];
  
  // If daily scale, just return the data as is
  if (scale === '1D') return data;
  
  // For weekly or monthly aggregation
  const aggregatedMap = new Map();
  
  data.forEach(item => {
    const date = new Date(item.date);
    let key: string;
    
    if (scale === '1W') {
      // For weekly, group by the Monday of each week
      const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday
      const monday = new Date(date.setDate(diff));
      key = monday.toISOString().split('T')[0];
    } else {
      // For monthly, group by month and year
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    }
    
    if (!aggregatedMap.has(key)) {
      aggregatedMap.set(key, {
        date: key,
        positive: 0,
        negative: 0,
        rawPnl: 0,
        count: 0
      });
    }
    
    const agg = aggregatedMap.get(key);
    
    // Sum up the values
    if (item.positive) agg.positive += item.positive;
    if (item.negative) agg.negative += item.negative;
    if (item.rawPnl) agg.rawPnl += item.rawPnl;
    agg.count++;
  });
  
  // Convert the map to an array and sort by date
  return Array.from(aggregatedMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const PortfolioPnL = memo(({ data, agentId }: PortfolioPnLProps) => {
  const isProfit = data.total > 0;
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [dayScale, setDayScale] = useState<DayScale>('1D');
  const [pnlMode, setPnlMode] = useState<PnLMode>('daily');
  const [chartData, setChartData] = useState<any[]>([]);
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);
  const [totalPnlData, setTotalPnlData] = useState<{
    pnl: number;
    pnlPercentage: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Fetch overall PnL data (for the header)
  useEffect(() => {
    if (!agentId) {
      return;
    }

    const fetchTotalPnL = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
        const apiKey = process.env.API_KEY || 'secret';

        const response = await fetch(`${apiUrl}/api/kpi/pnl/${agentId}`, {
          headers: {
            'x-api-key': apiKey,
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        console.log('Total PnL data:', result);

        setTotalPnlData({
          pnl: result.pnl,
          pnlPercentage: result.pnlPercentage,
        });
      } catch (error) {
        console.error('Error fetching total PnL data:', error);
        // Fall back to prop data
        setTotalPnlData(null);
      }
    };

    fetchTotalPnL();
  }, [agentId]);

  // Fetch daily PnL data based on the selected time range
  useEffect(() => {
    const fetchPnLData = async () => {
      if (!agentId) {
        // If no agentId, use fallback data
        const fallbackData = data.monthly.map((item) => ({
          date: item.date,
          positive: item.value > 0 ? item.value : 0,
          negative: item.value < 0 ? item.value : 0,
          rawPnl: item.value,
        }));
        setChartData(fallbackData);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create date range based on selected time period
        const now = new Date();
        let startDate;

        switch (timeRange) {
          case '1W':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case '1M':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
            break;
          case '3M':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'ALL':
          default:
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
        }

        const fromDate = startDate.toISOString();
        const toDate = now.toISOString();

        // Fetch PnL history from API
        const apiUrl =
          process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
        const apiKey = process.env.API_KEY || 'secret';

        console.log(
          `Fetching PnL data for agent ${agentId} from ${fromDate} to ${toDate}`,
        );

        const response = await fetch(
          `${apiUrl}/api/performance/${agentId}/history?interval=daily&from=${fromDate}&to=${toDate}`,
          {
            headers: {
              'x-api-key': apiKey,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        console.log('Daily PnL API Response:', result);

        // Store raw API response for debugging/analysis
        setApiResponse(result);

        if (
          !result.snapshots ||
          !Array.isArray(result.snapshots) ||
          result.snapshots.length === 0
        ) {
          console.warn('No snapshots found in API response');
          setError(
            'No performance data available for the selected time period',
          );
          return;
        }

        // Process the API response data
        const processPnLData = () => {
          // Log entire snapshots array to debug
          console.log('Raw snapshots array:', JSON.stringify(result.snapshots));

          // 1. First, create an array sorted by date
          const sortedSnapshots = [...result.snapshots].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );

          // 2. Generate data based on selected PnL mode
          if (pnlMode === 'daily') {
            // Daily mode: Calculate day-to-day changes
            return sortedSnapshots.map((snapshot, index, array) => {
              const date = new Date(snapshot.timestamp)
                .toISOString()
                .split('T')[0];

              // Log individual snapshot data for debugging
              console.log(`Snapshot ${index} (${date})`, {
                pnl: snapshot.pnl,
                pnl24h: snapshot.pnl24h,
                balanceInUSD: snapshot.balanceInUSD,
              });

              // Try different approaches for daily PnL:
              // First, try using pnl24h directly if it's available
              if (typeof snapshot.pnl24h === 'number') {
                const pnlValue = snapshot.pnl24h;
                return {
                  date,
                  positive: pnlValue > 0 ? pnlValue : 0,
                  negative: pnlValue < 0 ? pnlValue : 0,
                  rawPnl: pnlValue,
                  source: 'pnl24h', // Track where value came from
                  isActualData: true,
                };
              }

              // Second, if no pnl24h, try to calculate from cumulative PnL
              // by comparing with the previous day
              if (
                index > 0 &&
                typeof snapshot.pnl === 'number' &&
                typeof array[index - 1].pnl === 'number'
              ) {
                const pnlValue = snapshot.pnl - array[index - 1].pnl;
                return {
                  date,
                  positive: pnlValue > 0 ? pnlValue : 0,
                  negative: pnlValue < 0 ? pnlValue : 0,
                  rawPnl: pnlValue,
                  source: 'calculated', // Track where value came from
                  isActualData: true,
                };
              }

              // Third, if no pnl, try to calculate from balance changes
              if (
                index > 0 &&
                typeof snapshot.balanceInUSD === 'number' &&
                typeof array[index - 1].balanceInUSD === 'number'
              ) {
                const pnlValue =
                  snapshot.balanceInUSD - array[index - 1].balanceInUSD;
                return {
                  date,
                  positive: pnlValue > 0 ? pnlValue : 0,
                  negative: pnlValue < 0 ? pnlValue : 0,
                  rawPnl: pnlValue,
                  source: 'balance', // Track where value came from
                  isActualData: true,
                };
              }

              // Fallback: use a zero value if we can't determine the PnL
              return {
                date,
                positive: 0,
                negative: 0,
                rawPnl: 0,
                source: 'fallback', // Track where value came from
                isActualData: false,
              };
            });
          } else {
            // Cumulative mode: Use the running total PnL
            return sortedSnapshots.map((snapshot, index) => {
              const date = new Date(snapshot.timestamp)
                .toISOString()
                .split('T')[0];

              // Use the cumulative PnL value directly
              const pnlValue =
                typeof snapshot.pnl === 'number' ? snapshot.pnl : 0;

              return {
                date,
                positive: pnlValue > 0 ? pnlValue : 0,
                negative: pnlValue < 0 ? pnlValue : 0,
                rawPnl: pnlValue,
                source: 'cumulative', // Track where value came from
              };
            });
          }
        };

        const pnlData = processPnLData();

        // Make sure we have data for every day in the range if requested
        const allDates = generateDatesBetween(startDate, now);
        const dateMap = new Map();

        // Create a map of existing dates
        pnlData.forEach(
          (item: {
            date: string;
            positive: number;
            negative: number;
            rawPnl: number;
          }) => {
            dateMap.set(item.date, item);
          },
        );

        // Generate the complete data set with all dates
        const completeData = allDates.map((date: Date) => {
          const dateStr = date.toISOString().split('T')[0];

          if (dateMap.has(dateStr)) {
            return dateMap.get(dateStr);
          }

          // For missing dates, check if we should use interpolation
          // For PnL, we need to be careful with interpolation as it can be misleading
          // For the main view, use zero values for missing dates which is most honest
          // but for weekly/monthly aggregation we can be more flexible
          return {
            date: dateStr,
            positive: 0,
            negative: 0,
            rawPnl: 0,
            source: 'missing', // Track where value came from
            isActualData: false,
            isEmpty: true,
          };
        });

        // Sort by date
        completeData.sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        console.log('Processed Chart Data:', completeData);
        setChartData(completeData);
      } catch (error) {
        console.error('Error fetching PnL data:', error);
        setError('Failed to load performance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPnLData();
  }, [timeRange, pnlMode, agentId, data.monthly]);

  // Aggregate chart data based on day scale when chartData or dayScale changes
  useEffect(() => {
    setAggregatedData(aggregateDataByScale(chartData, dayScale));
  }, [chartData, dayScale]);

  // Calculate max and min values for chart scaling
  const maxValue = useMemo(() => {
    if (!aggregatedData.length) return 100;
    const max = Math.max(
      ...aggregatedData.map((item) =>
        Math.max(item.positive || 0, Math.abs(item.negative || 0)),
      ),
    );
    return max > 0 ? max : 100;
  }, [aggregatedData]);

  // Get total PnL values, prioritizing API fetched data
  const displayPnl =
    totalPnlData?.pnl !== undefined ? totalPnlData.pnl : data.total;
  const displayPercentage =
    totalPnlData?.pnlPercentage !== undefined
      ? totalPnlData.pnlPercentage
      : data.percentage;
  const isDisplayPnlProfit = isPnLPositive(displayPnl);

  return (
    <div className="space-y-4">
      {/* Total P&L Display */}
      <motion.div
        className="bg-[#232229] rounded-xl p-4 flex items-center border border-gray-800 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={cn(
            'p-3 rounded-lg mr-4',
            isProfit ? 'bg-green-500/20' : 'bg-red-500/20',
          )}
        >
          <DollarSign
            className={cn(
              'h-6 w-6',
              isProfit ? 'text-green-400' : 'text-red-400',
            )}
            strokeWidth={2}
          />
        </div>
        <div>
          <h3 className="text-sm text-gray-400 font-mono">
            Total Profit & Loss
          </h3>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                'text-2xl font-bold font-mono',
                isProfit ? 'text-green-400' : 'text-red-400',
              )}
            >
              {isDisplayPnlProfit ? '+' : '-'}$
              {Math.abs(displayPnl).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
            <span
              className={cn(
                'text-sm font-mono',
                isProfit ? 'text-green-400/70' : 'text-red-400/70',
              )}
            >
              ({isProfit ? '+' : ''}
              {data.percentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-4">
        {/* Time Range Selector */}
        <div className="flex bg-[#232229] rounded-lg p-1 border border-gray-800">
          {(['1W', '1M', '3M', 'ALL'] as const).map((range) => (
            <Button
              key={range}
              size="sm"
              variant={timeRange === range ? 'default' : 'ghost'}
              className={cn(
                'text-xs h-7 px-3',
                timeRange === range
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <Tabs 
          defaultValue={pnlMode} 
          className="w-full md:w-auto"
          onValueChange={(value) => setPnlMode(value as PnLMode)}
        >
          <TabsList className="grid w-full grid-cols-2 bg-[#232229] border border-gray-800">
            <TabsTrigger 
              value="daily" 
              className={cn(
                "data-[state=active]:bg-orange-500 data-[state=active]:text-white",
                "flex items-center gap-1"
              )}
            >
              <BarChart2 className="w-3 h-3" />
              Daily
            </TabsTrigger>
            <TabsTrigger 
              value="cumulative"
              className={cn(
                "data-[state=active]:bg-orange-500 data-[state=active]:text-white",
                "flex items-center gap-1"
              )}
            >
              <TrendingUp className="w-3 h-3" />
              Cumulative
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* P&L Chart */}
      <motion.div
        className="bg-[#232229] rounded-xl p-4 border border-gray-800 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="text-sm font-medium mb-3 text-gray-300">
          {pnlMode === 'daily' ? 'Daily' : 'Cumulative'} P&L Chart
        </h3>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              {error}
            </div>
          ) : aggregatedData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aggregatedData}
                margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#333340"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => formatDate(date, dayScale)}
                  tick={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fill: '#9CA3AF',
                  }}
                  tickLine={false}
                  axisLine={{ stroke: '#333340' }}
                  interval={dayScale === '1D' ? 'preserveStartEnd' : 0}
                />
                <YAxis
                  tickCount={5}
                  tick={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fill: '#9CA3AF',
                  }}
                  tickFormatter={(value) =>
                    `${value >= 0 ? '' : '-'}$${Math.abs(value).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      },
                    )}`
                  }
                  tickLine={false}
                  axisLine={false}
                  domain={
                    pnlMode === 'daily'
                      ? [-(maxValue * 0.5), maxValue]
                      : ['auto', 'auto']
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#4B5563" />
                {/* Positive values (green bars) with better styling */}
                <Bar
                  dataKey="positive"
                  name="Profit"
                  fill="#22C55E"
                  fillOpacity={0.9}
                  strokeOpacity={1}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={
                    dayScale === '1D' ? 20 : dayScale === '1W' ? 40 : 60
                  }
                />
                {/* Negative values (red bars) with better styling */}
                <Bar
                  dataKey="negative"
                  name="Loss"
                  fill="#EF4444"
                  fillOpacity={0.9}
                  strokeOpacity={1}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={
                    dayScale === '1D' ? 20 : dayScale === '1W' ? 40 : 60
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </div>
  );
});

PortfolioPnL.displayName = 'PortfolioPnL';

export default PortfolioPnL;
