'use client';

import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ButtonSelector from '@/components/ui/button-selector';
// Import our server actions
import {
  getPortfolioHistoricalData,
  type SnapshotData,
} from '@/actions/agents/portfolio/getPortfolioHistoricalData';
import { getPortfolioLatestValues } from '@/actions/agents/portfolio/getPortfolioLatestValues';
// Define time range type locally to avoid import conflict
type TimeRange = '1W' | '1M' | '3M' | 'ALL';

interface ChartData {
  date: string;
  value: number;
}

interface PortfolioChartProps {
  data: ChartData[];
  totalValue: number;
  change24h: number;
  changeValue24h: number;
  agentId?: string;
}

// Format date to display month and day
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Day scale options for data aggregation
// type DayScale = '1D' | '1W' | '1M';

// Define interfaces and types for the data structures
interface ChartDataItem extends ChartData {
  isActualData?: boolean;
  tradeCount?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataItem;
  }>;
  label?: string;
}

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

const PortfolioChart = memo(
  ({
    data,
    totalValue,
    change24h,
    changeValue24h,
    agentId,
  }: PortfolioChartProps) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('1W');
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
      if (active && payload && payload.length) {
        // Handle date format based on whether it's a timestamp or date string
        let formattedDate = label || '';
        try {
          const date = new Date(label || '');
          if (timeRange === '1W') {
            formattedDate = date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            });
          } else {
            formattedDate = formatDate(label || '');
          }
        } catch (e) {
          console.error('Date formatting error:', e);
        }

        const data = payload[0].payload;

        return (
          <div className="bg-[#232229] p-3 rounded-lg shadow-lg border border-gray-700 text-white">
            <p className="font-mono text-sm font-semibold text-gray-300">
              {formattedDate}
            </p>
            <p className="font-mono text-lg text-white">
              $
              {payload[0].value.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
            {data.tradeCount && timeRange === '1W' && (
              <p className="font-mono text-sm text-gray-400 mt-1">
                Trades: {data.tradeCount}
              </p>
            )}
          </div>
        );
      }

      return null;
    };

    // Use useCallback to memoize the filterByTimeRange function

    // Helper to filter data for display
    const filteredData = () => {
      if (chartData.length === 0) return [];

      const now = new Date();

      switch (timeRange) {
        case '1W': {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 8); // Include one extra day
          return chartData.filter((item) => new Date(item.date) >= oneWeekAgo);
        }
        case '1M': {
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return chartData.filter((item) => new Date(item.date) >= oneMonthAgo);
        }
        case '3M': {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          return chartData.filter(
            (item) => new Date(item.date) >= threeMonthsAgo,
          );
        }
        case 'ALL':
        default:
          return chartData;
      }
    };

    // Fetch total portfolio value and PnL data
    useEffect(() => {
      if (!agentId) {
        // Use prop data if no agentId
        setChartData(
          data.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          ),
        );
        return;
      }

      const fetchLatestValues = async () => {
        try {
          // Use the server action instead of direct API call
          const result = await getPortfolioLatestValues(agentId);

          if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch portfolio data');
          }

          console.log('Portfolio KPI data:', result.data);

          // Update portfolio values with API data
          const latestBalance = result.data.latestBalance || totalValue;
          const pnlValue =
            result.data.pnl24h || result.data.pnl || changeValue24h;

          // Calculate 24h change percentage using current portfolio value
          // Formula: (change / current value) * 100
          const pnlPercentage =
            latestBalance > 0 ? (pnlValue / latestBalance) * 100 : 0;

          console.log('Portfolio values:', {
            latestBalance,
            pnlValue,
            calculatedPercentage: pnlPercentage,
            apiPercentage: result.data.pnlPercentage,
          });

          // Don't update chartData here - it will be updated by the other useEffect
        } catch (error) {
          console.error('Error fetching portfolio KPI data:', error);
          // Fall back to prop data if API fails
        }
      };

      fetchLatestValues();
    }, [agentId, data, totalValue, change24h, changeValue24h]);

    // Fetch portfolio history data when time range changes
    useEffect(() => {
      // Skip if no agent ID
      if (!agentId) {
        console.log('No agent ID provided, skipping historical data fetch');
        setChartData(data || []);
        return;
      }

      const fetchHistoricalData = async () => {
        setIsLoading(true);
        setError(null);

        try {
          // Use the server action instead of direct API call
          const result = await getPortfolioHistoricalData(agentId, timeRange);

          if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to fetch historical data');
          }

          console.log('Portfolio history data:', result.data);

          if (
            !result.data.snapshots ||
            !Array.isArray(result.data.snapshots) ||
            result.data.snapshots.length === 0
          ) {
            console.warn('No snapshots found in API response');
            setError(
              'No portfolio history available for the selected time period',
            );
            setChartData([]);
            return;
          }

          // Process the API response data - select 3 points per day
          const processPortfolioData = (snapshots: SnapshotData[]) => {
            // Group snapshots by day
            const snapshotsByDay = new Map<string, SnapshotData[]>();

            snapshots.forEach((snapshot) => {
              const date = new Date(snapshot.timestamp);
              const dayKey = date.toISOString().split('T')[0]; // Use date as key

              if (!snapshotsByDay.has(dayKey)) {
                snapshotsByDay.set(dayKey, []);
              }

              snapshotsByDay.get(dayKey)?.push(snapshot);
            });

            // Select 3 points per day: morning (first), mid-day, and evening (last)
            const selectedSnapshots: SnapshotData[] = [];

            snapshotsByDay.forEach((daySnapshots) => {
              if (daySnapshots.length === 0) return;

              // Sort snapshots by time
              const sortedSnapshots = [...daySnapshots].sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime(),
              );

              // Always add first snapshot (morning)
              selectedSnapshots.push(sortedSnapshots[0]);

              // Add mid-day snapshot if we have at least 3 snapshots
              if (sortedSnapshots.length >= 3) {
                const midIndex = Math.floor(sortedSnapshots.length / 2);
                selectedSnapshots.push(sortedSnapshots[midIndex]);
              }

              // Add last snapshot (evening) if different from first
              if (sortedSnapshots.length > 1) {
                selectedSnapshots.push(
                  sortedSnapshots[sortedSnapshots.length - 1],
                );
              }
            });

            // Map selected snapshots to chart data format
            const formattedData = selectedSnapshots.map((snapshot) => {
              return {
                date: snapshot.timestamp, // Keep full timestamp
                value:
                  typeof snapshot.balanceInUSD === 'number'
                    ? snapshot.balanceInUSD
                    : 0,
                tradeCount: snapshot.tradeCount,
                isActualData: true,
              };
            });

            // Sort by timestamp
            return formattedData.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );
          };

          const portfolioData = processPortfolioData(result.data.snapshots);

          // For 1W view with hourly data, we need to ensure a full week is displayed
          if (timeRange === '1W') {
            // First sort the portfolio data by date
            portfolioData.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

            // Create a full week of data
            const fullWeekData = [];
            const now = new Date();
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);

            // Create a daily placeholder for each day in the week
            for (
              let d = new Date(oneWeekAgo);
              d <= now;
              d.setDate(d.getDate() + 1)
            ) {
              const dayStr = d.toISOString().split('T')[0];

              // Check if we have data for this day
              const dayData = portfolioData.filter(
                (item) =>
                  new Date(item.date).toISOString().split('T')[0] === dayStr,
              );

              if (dayData.length > 0) {
                // We have data for this day, use it
                fullWeekData.push(...dayData);
              } else {
                // No data for this day, add a placeholder with zero or the last known value
                const lastKnownValue: number =
                  fullWeekData.length > 0
                    ? fullWeekData[fullWeekData.length - 1].value
                    : 0;

                // Create a placeholder at noon for this day
                const placeholder = new Date(dayStr);
                placeholder.setHours(12, 0, 0);

                fullWeekData.push({
                  date: placeholder.toISOString(),
                  value: lastKnownValue,
                  isActualData: false,
                });
              }
            }

            // Sort the data again to ensure it's in chronological order
            fullWeekData.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

            console.log('Full week data:', fullWeekData);
            setChartData(fullWeekData);
          } else {
            // For longer time ranges, ensure we have data for every day
            // Define the start date based on the first snapshot's timestamp
            const startDate = new Date(result.data.snapshots[0].timestamp);
            const allDates = generateDatesBetween(startDate, new Date());
            const dateMap = new Map();

            // Create a map of existing dates (strip time for non-weekly views)
            portfolioData.forEach((item: ChartDataItem) => {
              const dateKey = new Date(item.date).toISOString().split('T')[0];
              dateMap.set(dateKey, {
                ...item,
                date: dateKey, // Use date without time for longer views
              });
            });

            // Generate the complete data set with all dates
            const completeData = allDates.map((date) => {
              const dateStr = date.toISOString().split('T')[0];

              if (dateMap.has(dateStr)) {
                return dateMap.get(dateStr);
              }

              // For missing dates, estimate value by using the most recent previous value
              let estimatedValue = 0;
              const currentDate = new Date(date);
              currentDate.setDate(currentDate.getDate() - 1);

              while (currentDate >= allDates[0]) {
                const checkDateStr = currentDate.toISOString().split('T')[0];
                if (dateMap.has(checkDateStr)) {
                  estimatedValue = dateMap.get(checkDateStr).value;
                  break;
                }
                currentDate.setDate(currentDate.getDate() - 1);
              }

              // Return estimated value for missing date
              return {
                date: dateStr,
                value: estimatedValue,
                isActualData: false,
              };
            });

            // Sort by date
            completeData.sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            );

            console.log('Processed Portfolio Chart Data:', completeData);
            setChartData(completeData);
          }
        } catch (error) {
          console.error('Error fetching portfolio history:', error);
          setError('Failed to load portfolio history');
          setChartData([]);
        } finally {
          setIsLoading(false);
        }
      };

      console.log('Fetching historical data for agent', agentId);
      fetchHistoricalData();
    }, [timeRange, agentId, data]);

    return (
      <div className="space-y-4">
        {/* Total Value Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Total Value */}
          <motion.div
            className="bg-[#232229] rounded-xl p-4 flex items-center border border-gray-800 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-3 rounded-lg bg-gray-800/50 mr-4">
              <Wallet className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 font-mono">
                Total Portfolio Value
              </h3>
              <div className="text-2xl font-bold font-mono text-white">
                $
                {totalValue.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
          </motion.div>

          {/* 24h Change */}
          <motion.div
            className="bg-[#232229] rounded-xl p-4 flex items-center border border-gray-800 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              className={cn(
                'p-3 rounded-lg mr-4',
                change24h >= 0 ? 'bg-green-500/20' : 'bg-red-500/20',
              )}
            >
              {change24h >= 0 ? (
                <ArrowUp className="h-6 w-6 text-green-400" strokeWidth={2.5} />
              ) : (
                <ArrowDown className="h-6 w-6 text-red-400" strokeWidth={2.5} />
              )}
            </div>
            <div>
              <h3 className="text-sm text-gray-400 font-mono">24h Change</h3>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-2xl font-bold font-mono',
                    change24h >= 0 ? 'text-green-400' : 'text-red-400',
                  )}
                >
                  {changeValue24h >= 0 ? '+' : ''}$
                  {changeValue24h.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
                <span
                  className={cn(
                    'text-sm font-mono',
                    change24h >= 0 ? 'text-green-400/70' : 'text-red-400/70',
                  )}
                >
                  {change24h >= 0 ? '+' : ''}
                  {((change24h / (totalValue - change24h)) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Time Range Selector - use ButtonSelector component */}
        <div className="flex justify-end mb-2">
          <ButtonSelector<TimeRange>
            options={['1W', '1M', '3M', 'ALL'] as const}
            value={timeRange}
            onChange={setTimeRange}
          />
        </div>

        {/* Chart */}
        <div className="bg-[#232229] rounded-xl p-4 border border-gray-800">
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                {error}
              </div>
            ) : filteredData().length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredData()}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF8C00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#333340"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      if (timeRange === '1W') {
                        // For weekly view with hourly data points
                        return date.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          hour12: true,
                        });
                      }
                      // For other views
                      return formatDate(value);
                    }}
                    tick={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      fill: '#9CA3AF',
                    }}
                    tickLine={false}
                    axisLine={{ stroke: '#333340' }}
                    interval={timeRange === '1W' ? 4 : 'preserveEnd'}
                    domain={['dataMin', 'dataMax']}
                  />
                  <YAxis
                    tickCount={5}
                    tick={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      fill: '#9CA3AF',
                    }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) {
                        return `$${(value / 1000000).toFixed(1)}M`;
                      } else if (value >= 1000) {
                        return `$${(value / 1000).toFixed(1)}k`;
                      }
                      return `$${value}`;
                    }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#FF8C00"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    activeDot={{
                      r: 6,
                      stroke: '#FF8C00',
                      strokeWidth: 2,
                      fill: '#232229',
                    }}
                    dot={
                      timeRange === '1W'
                        ? {
                            r: 3,
                            fill: '#232229',
                            stroke: '#FF8C00',
                            strokeWidth: 1.5,
                          }
                        : false
                    }
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  },
);

PortfolioChart.displayName = 'PortfolioChart';

export default PortfolioChart;
