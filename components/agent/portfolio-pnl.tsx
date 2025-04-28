'use client';

import { memo, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, DollarSign, BarChart2 } from 'lucide-react';
import { cn, isPnLPositive } from '@/lib/utils';
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
// Import our new components
import DarkSectionCard from '@/components/ui/dark-section-card';
import ButtonSelector from '@/components/ui/button-selector';

// Time range options
type TimeRange = '1W' | '1M' | '3M' | 'ALL';

// Day scale options for data aggregation
type DayScale = '1D' | '1W' | '1M';

// ViewMode type for better type safety
type ViewMode = 'daily' | 'cumulative';

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
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: {
      timestamp?: string;
    };
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // Get the first non-zero value (either positive or negative)
    const activePayload = payload.find((p) => p.value !== 0);
    if (!activePayload) return null;

    const value = activePayload.value;
    const isProfit = activePayload.dataKey === 'positive';

    // Format the date based on timeRange if available in the payload data
    let formattedDate = label || '';
    try {
      // See if we can access timeRange from the payload's originalData
      const isWeeklyView = payload[0]?.payload?.timestamp !== undefined;

      if (isWeeklyView && payload[0]?.payload?.timestamp) {
        const date = new Date(payload[0].payload.timestamp || label || '');
        formattedDate = date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        });
      }
    } catch (e) {
      console.error('Date formatting error:', e);
    }

    return (
      <div className="bg-[#232229] p-3 rounded-lg shadow-lg border border-gray-700 text-white">
        <p className="font-mono text-sm font-semibold text-gray-300">
          {formattedDate}
        </p>
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });
  }
};

// Aggregate data by day scale (daily, weekly, monthly)
interface DataItem {
  date: string;
  positive?: number;
  negative?: number;
  rawPnl?: number;
  [key: string]: unknown;
}

const aggregateDataByScale = (
  data: DataItem[],
  scale: DayScale,
): DataItem[] => {
  if (!data || data.length === 0) return [];

  // If daily scale, just return the data as is
  if (scale === '1D') return data;

  // For weekly or monthly aggregation
  const aggregatedMap = new Map();

  data.forEach((item) => {
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
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}-01`;
    }

    if (!aggregatedMap.has(key)) {
      aggregatedMap.set(key, {
        date: key,
        positive: 0,
        negative: 0,
        rawPnl: 0,
        count: 0,
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
  return Array.from(aggregatedMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
};

// Create a complete dataset with optimal data density
interface OptimalDataItem extends DataItem {
  timestamp: string;
  source: string;
  isActualData: boolean;
}

const PortfolioPnL = memo(({ data, agentId }: PortfolioPnLProps) => {
  const isProfit = data.total > 0;
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  const [dayScale, setDayScale] = useState<DayScale>('1D');
  const [chartData, setChartData] = useState<DataItem[]>([]);
  const [aggregatedData, setAggregatedData] = useState<DataItem[]>([]);
  const [totalPnlData, setTotalPnlData] = useState<{
    pnl: number;
    pnlPercentage: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

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

          // Filter out snapshots with invalid balance values
          const validSnapshots = sortedSnapshots.filter(
            (snapshot) =>
              (typeof snapshot.balanceInUSD === 'number' &&
                !isNaN(snapshot.balanceInUSD)) ||
              (typeof snapshot.pnl === 'number' && !isNaN(snapshot.pnl)) ||
              (typeof snapshot.pnl24h === 'number' && !isNaN(snapshot.pnl24h)),
          );

          if (validSnapshots.length === 0) {
            console.warn('No valid snapshots found after filtering');
            return [];
          }

          // Calculate day-to-day changes
          const dailyPnlData = validSnapshots
            .map((snapshot, index, array) => {
              const date = new Date(snapshot.timestamp)
                .toISOString()
                .split('T')[0];

              let pnlValue = 0;
              let source = 'unknown';

              // Priority 1: Use pnl24h if available (most accurate for daily data)
              if (
                typeof snapshot.pnl24h === 'number' &&
                !isNaN(snapshot.pnl24h)
              ) {
                pnlValue = snapshot.pnl24h;
                source = 'pnl24h';
              }
              // Priority 2: Calculate from day-to-day PnL changes
              else if (
                index > 0 &&
                typeof snapshot.pnl === 'number' &&
                !isNaN(snapshot.pnl) &&
                typeof array[index - 1].pnl === 'number' &&
                !isNaN(array[index - 1].pnl)
              ) {
                pnlValue = snapshot.pnl - array[index - 1].pnl;
                source = 'calculated_pnl';
              }
              // Priority 3: Calculate from balance changes
              else if (
                index > 0 &&
                typeof snapshot.balanceInUSD === 'number' &&
                !isNaN(snapshot.balanceInUSD) &&
                typeof array[index - 1].balanceInUSD === 'number' &&
                !isNaN(array[index - 1].balanceInUSD)
              ) {
                pnlValue =
                  snapshot.balanceInUSD - array[index - 1].balanceInUSD;
                source = 'calculated_balance';
              }

              // Log source of PnL data for this entry
              console.log(
                `Daily data (${date}): value=${pnlValue}, source=${source}`,
              );

              return {
                date,
                timestamp: snapshot.timestamp,
                positive: pnlValue > 0 ? pnlValue : 0,
                negative: pnlValue < 0 ? pnlValue : 0,
                rawPnl: pnlValue,
                source,
                isActualData: source !== 'unknown',
              };
            })
            .filter((item) => item.isActualData); // Only include items with actual data

          // Group snapshots by day for all time ranges to ensure consistent data density
          const snapshotsByDay = new Map<string, OptimalDataItem[]>();

          dailyPnlData.forEach((item) => {
            const date = new Date(item.timestamp);
            const dayKey = date.toISOString().split('T')[0]; // Use date as key

            if (!snapshotsByDay.has(dayKey)) {
              snapshotsByDay.set(dayKey, []);
            }

            snapshotsByDay.get(dayKey)?.push({
              ...item,
              timestamp: item.timestamp,
              source: item.source,
              isActualData: item.isActualData,
            });
          });

          // Determine date range based on selected time period
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

          // Create a complete dataset with optimal data density
          const optimalData: OptimalDataItem[] = [];

          // Generate all dates in the range
          const allDates: Date[] = [];
          const currentDate = new Date(startDate);
          while (currentDate <= now) {
            allDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          // For each day in the range
          allDates.forEach((day) => {
            const dayStr = day.toISOString().split('T')[0];
            const dayData = snapshotsByDay.get(dayStr) || [];

            if (dayData.length > 0) {
              // Sort the day's data points by time
              const sortedDayData = dayData.sort(
                (a: { timestamp: string }, b: { timestamp: string }) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime(),
              );

              // Select up to 3 points (morning, mid-day, evening)
              const selectedPoints: OptimalDataItem[] = [];

              // Morning - first point
              selectedPoints.push(sortedDayData[0]);

              // Mid-day - if we have at least 3 points
              if (sortedDayData.length >= 3) {
                const midIndex = Math.floor(sortedDayData.length / 2);
                selectedPoints.push(sortedDayData[midIndex]);
              }

              // Evening - last point if different from first
              if (sortedDayData.length > 1) {
                selectedPoints.push(sortedDayData[sortedDayData.length - 1]);
              }

              // Add the selected points to our dataset
              optimalData.push(...selectedPoints);
            } else if (timeRange === '1W') {
              // For weekly view, add placeholders for empty days
              // For longer views, we'll let the chart interpolate
              const placeholder = new Date(dayStr);
              placeholder.setHours(12, 0, 0);

              optimalData.push({
                date: dayStr,
                timestamp: placeholder.toISOString(),
                positive: 0,
                negative: 0,
                rawPnl: 0,
                source: 'placeholder',
                isActualData: false,
              });
            }
          });

          // Sort the data chronologically
          optimalData.sort(
            (a: { timestamp: string }, b: { timestamp: string }) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );

          console.log(`Processed PnL data (${timeRange}):`, optimalData.length);
          return optimalData;
        };

        const pnlData = processPnLData();

        if (pnlData.length === 0) {
          console.warn('No valid PnL data points after filtering');
          setError(
            'No valid performance data available for the selected time period',
          );
          setChartData([]);
          return;
        }

        // Sort by date
        pnlData.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        console.log('Processed Chart Data (actual data only):', pnlData);
        setChartData(pnlData);
      } catch (error) {
        console.error('Error fetching PnL data:', error);
        setError('Failed to load performance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPnLData();
  }, [timeRange, agentId, data.monthly]);

  // Aggregate chart data based on day scale when chartData or dayScale changes
  useEffect(() => {
    setAggregatedData(aggregateDataByScale(chartData, dayScale));
  }, [chartData, dayScale]);

  // Process aggregated data based on view mode
  const processedData = useMemo(() => {
    if (viewMode === 'daily') {
      return aggregatedData;
    } else {
      // For cumulative view, we need to calculate running total
      let cumulativeTotal = 0;
      return aggregatedData.map((item) => {
        cumulativeTotal += item.rawPnl ?? 0;
        return {
          ...item,
          positive: cumulativeTotal > 0 ? cumulativeTotal : 0,
          negative: cumulativeTotal < 0 ? cumulativeTotal : 0,
          rawPnl: cumulativeTotal,
        };
      });
    }
  }, [aggregatedData, viewMode]);

  // Calculate max and min values for chart scaling
  const maxValue = useMemo(() => {
    if (!processedData.length) return 100;
    const max = Math.max(
      ...processedData.map((item) =>
        Math.max(item.positive || 0, Math.abs(item.negative || 0)),
      ),
    );
    return max > 0 ? max : 100;
  }, [processedData]);

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
              {displayPercentage ? displayPercentage.toFixed(2) : '0.00'}%)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex justify-between mb-4 flex-wrap gap-2">
        {/* View toggle - Using ButtonSelector */}
        <ButtonSelector<ViewMode>
          options={['daily', 'cumulative'] as const}
          value={viewMode}
          onChange={setViewMode}
        />

        {/* Data Scale - Using ButtonSelector */}
        {timeRange !== '1W' && (
          <ButtonSelector<DayScale>
            options={['1D', '1W', '1M'] as const}
            value={dayScale}
            onChange={setDayScale}
          />
        )}

        {/* Time range selector - Using ButtonSelector */}
        <ButtonSelector<TimeRange>
          options={['1W', '1M', '3M', 'ALL'] as const}
          value={timeRange}
          onChange={setTimeRange}
        />
      </div>

      {/* P&L Chart - Using DarkSectionCard */}
      <DarkSectionCard
        title={viewMode === 'daily' ? 'Daily P&L' : 'Cumulative P&L'}
        icon={<BarChart2 className="h-4 w-4 text-orange-500" />}
      >
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              {error}
            </div>
          ) : processedData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData}
                margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#333340"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    // Check if we're in weekly view with timestamp data
                    const item = chartData.find((i) => i.date === value);
                    if (timeRange === '1W' && item?.timestamp) {
                      const date = new Date(String(item.timestamp));
                      return date.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        hour12: true,
                      });
                    }
                    return formatDate(value, dayScale);
                  }}
                  tick={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fill: '#9CA3AF',
                  }}
                  tickLine={false}
                  axisLine={{ stroke: '#333340' }}
                  interval={(() => {
                    // Smart interval based on time range and data density
                    if (timeRange === '1W') return 3; // Every 3rd point for weekly
                    if (timeRange === '1M')
                      return Math.ceil(processedData.length / 10); // ~10 ticks for monthly
                    if (timeRange === '3M')
                      return Math.ceil(processedData.length / 12); // ~12 ticks for quarterly
                    return 'preserveStartEnd'; // Start and end for ALL
                  })()}
                />
                <YAxis
                  tickCount={5}
                  tick={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fill: '#9CA3AF',
                  }}
                  tickFormatter={(value) => {
                    // Format Y-axis ticks without decimal places
                    if (value >= 1000000 || value <= -1000000) {
                      return `${value >= 0 ? '' : '-'}$${Math.abs(
                        value / 1000000,
                      ).toFixed(1)}M`;
                    } else if (value >= 1000 || value <= -1000) {
                      return `${value >= 0 ? '' : '-'}$${Math.abs(
                        value / 1000,
                      ).toFixed(1)}k`;
                    }
                    return `${value >= 0 ? '' : '-'}$${Math.abs(
                      value,
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}`;
                  }}
                  tickLine={false}
                  axisLine={false}
                  domain={
                    viewMode === 'daily'
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
      </DarkSectionCard>
    </div>
  );
});

PortfolioPnL.displayName = 'PortfolioPnL';

export default PortfolioPnL;
