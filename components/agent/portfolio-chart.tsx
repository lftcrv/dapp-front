'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  date: string;
  value: number;
}

interface PortfolioChartProps {
  data: ChartData[];
  totalValue: number;
  change24h: number;
  changeValue24h: number;
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#232229] p-3 rounded-lg shadow-lg border border-gray-700 text-white">
        <p className="font-mono text-sm font-semibold text-gray-300">{label}</p>
        <p className="font-mono text-lg text-white">
          Ξ{payload[0].value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    );
  }

  return null;
};

// Format date to display month and day
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Time range options
type TimeRange = '1W' | '1M' | '3M' | 'ALL';

const PortfolioChart = memo(
  ({ data, totalValue, change24h, changeValue24h }: PortfolioChartProps) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [apiResponse, setApiResponse] = useState<any>(null);
    const [portfolioValues, setPortfolioValues] = useState<{
      totalValue: number;
      change24h: number;
      changeValue24h: number;
    }>({
      totalValue,
      change24h,
      changeValue24h
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch total portfolio value and PnL data
    useEffect(() => {
      if (!agentId) {
        // Use prop data if no agentId
        setChartData(
          data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        );
        return;
      }
      
      const fetchLatestValues = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
          const apiKey = process.env.API_KEY || 'secret';
          
          // Fetch from the KPI endpoint for overall values
          const response = await fetch(
            `${apiUrl}/api/kpi/pnl/${agentId}`,
            {
              headers: {
                'x-api-key': apiKey
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }
          
          const result = await response.json();
          console.log('Portfolio KPI data:', result);
          
          // Update portfolio values
          setPortfolioValues({
            totalValue: result.latestBalance || totalValue,
            change24h: result.pnlPercentage || change24h,
            changeValue24h: result.pnl || changeValue24h
          });
        } catch (error) {
          console.error('Error fetching portfolio KPI data:', error);
          // Fall back to prop data
        }
      };
      
      fetchLatestValues();
    }, [agentId, data, totalValue, change24h, changeValue24h]);
    
    // Fetch portfolio history data when time range changes
    useEffect(() => {
      if (!agentId) {
        // Filter and use prop data based on selected time range if no agentId
        const filteredData = filterByTimeRange(data, timeRange);
        setChartData(filteredData);
        return;
      }
      
      const fetchHistoricalData = async () => {
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
          
          // Fetch historical performance data
          const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
          const apiKey = process.env.API_KEY || 'secret';
          
          console.log(`Fetching portfolio history for agent ${agentId} from ${fromDate} to ${toDate}`);
          
          const response = await fetch(
            `${apiUrl}/api/performance/${agentId}/history?interval=daily&from=${fromDate}&to=${toDate}`,
            {
              headers: {
                'x-api-key': apiKey
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }
          
          const result = await response.json();
          console.log('Portfolio history data:', result);
          setApiResponse(result);
          
          if (!result.snapshots || !Array.isArray(result.snapshots) || result.snapshots.length === 0) {
            console.warn('No snapshots found in API response');
            setError('No portfolio history available for the selected time period');
            setChartData(generateTestData(timeRange));
            return;
          }
          
          // Process the API response data - use balanceInUSD for the portfolio value
          const processPortfolioData = () => {
            return result.snapshots.map((snapshot: any) => {
              const date = new Date(snapshot.timestamp).toISOString().split('T')[0];
              // Use balanceInUSD for the portfolio value at this point in time
              const portfolioValue = typeof snapshot.balanceInUSD === 'number' ? snapshot.balanceInUSD : 0;
              
              return {
                date,
                value: portfolioValue,
                isActualData: true // Flag to indicate this is real data, not estimated
              };
            });
          };
          
          const portfolioData = processPortfolioData();
          
          // Make sure we have data for every day in the range
          const allDates = generateDatesBetween(startDate, now);
          const dateMap = new Map();
          
          // Create a map of existing dates
          portfolioData.forEach((item: { date: string; value: number, isActualData: boolean }) => {
            dateMap.set(item.date, item);
          });
          
          // Generate the complete data set with all dates
          const completeData = allDates.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            
            if (dateMap.has(dateStr)) {
              return dateMap.get(dateStr);
            }
            
            // For missing dates, estimate value by using the most recent previous value
            let estimatedValue = 0;
            const currentDate = new Date(date);
            currentDate.setDate(currentDate.getDate() - 1);
            
            while (currentDate >= startDate) {
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
              isActualData: false, // Flag to indicate this is estimated data
              isEstimated: true
            };
          });
          
          // Sort by date
          completeData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          console.log('Processed Portfolio Chart Data:', completeData);
          setChartData(completeData);
        } catch (error) {
          console.error('Error fetching portfolio history:', error);
          setError('Failed to load portfolio history');
          // Use test data as fallback
          setChartData(generateTestData(timeRange));
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchHistoricalData();
    }, [timeRange, agentId, data]);
    
    // Helper to filter prop data based on time range
    const filterByTimeRange = (inputData: ChartData[], range: TimeRange): ChartData[] => {
      if (!inputData || inputData.length === 0) return [];
      
      const now = new Date();
      
      switch (timeRange) {
        case '1W':
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return data.filter(item => new Date(item.date) >= oneWeekAgo);
        
        case '1M':
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return data.filter(item => new Date(item.date) >= oneMonthAgo);
        
        case '3M':
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          return data.filter(item => new Date(item.date) >= threeMonthsAgo);
        
        case 'ALL':
        default:
          return data;
      }
    };

    const chartData = filteredData();
    
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
                Ξ{totalValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
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
                change24h >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
              )}
            >
              {change24h >= 0 ? (
                <ArrowUp
                  className="h-6 w-6 text-green-400"
                  strokeWidth={2.5}
                />
              ) : (
                <ArrowDown
                  className="h-6 w-6 text-red-400"
                  strokeWidth={2.5}
                />
              )}
            </div>
            <div>
              <h3 className="text-sm text-gray-400 font-mono">
                24h Change
              </h3>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-2xl font-bold font-mono',
                    change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {change24h >= 0 ? '+' : ''}
                  {change24h.toFixed(2)}%
                </span>
                <span
                  className={cn(
                    'text-sm font-mono',
                    change24h >= 0 ? 'text-green-400/70' : 'text-red-400/70'
                  )}
                >
                  {changeValue24h >= 0 ? '+' : ''}
                  Ξ
                  {changeValue24h.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-end mb-2">
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
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[#232229] rounded-xl p-4 border border-gray-800">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
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
                  tickFormatter={formatDate} 
                  tick={{ fontSize: 12, fontFamily: 'monospace', fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={{ stroke: '#333340' }}
                />
                <YAxis 
                  tickCount={5}
                  tick={{ fontSize: 12, fontFamily: 'monospace', fill: '#9CA3AF' }}
                  tickFormatter={(value) => `Ξ${value/1000}k`}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 1000', 'dataMax + 1000']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#FF8C00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  activeDot={{ r: 6, stroke: '#FF8C00', strokeWidth: 2, fill: '#232229' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }
);

PortfolioChart.displayName = 'PortfolioChart';

export default PortfolioChart; 