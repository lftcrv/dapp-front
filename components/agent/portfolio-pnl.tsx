'use client';

import { memo, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

interface PnLData {
  total: number;
  percentage: number;
  monthly: Array<{
    date: string;
    value: number;
  }>;
  agentId?: string;
}

interface PortfolioPnLProps {
  data: PnLData;
}

// Time range options
type TimeRange = '1W' | '1M' | '3M' | 'ALL';

// Day scale options
type DayScale = '1D' | '1W' | '1M';

// PnL Calculation modes
type PnLMode = 'daily' | 'cumulative';

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
        <p className={cn(
          "font-mono text-lg flex items-center gap-1",
          isProfit ? "text-green-400" : "text-red-400"
        )}>
          {isProfit ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          ${Math.abs(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    );
  }

  return null;
};

// Format date based on day scale
const formatDate = (dateStr: string, dayScale: DayScale) => {
  const date = new Date(dateStr);
  
  switch (dayScale) {
    case '1D':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case '1W':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case '1M':
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// Generate dates between start and end
const generateDatesBetween = (startDate: Date, endDate: Date) => {
  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Generate testing data when API is not available
const generateTestData = (timeRange: TimeRange) => {
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
  
  const dates = generateDatesBetween(startDate, now);
  
  return dates.map(date => {
    // Generate random PnL value, weighted towards positive
    const random = Math.random();
    let value;
    if (random > 0.3) {
      // 70% chance of profit
      value = Math.random() * 200; // 0-200 profit
    } else {
      // 30% chance of loss
      value = -Math.random() * 100; // 0-100 loss
    }
    
    return {
      date: date.toISOString().split('T')[0],
      positive: value > 0 ? value : 0,
      negative: value < 0 ? value : 0,
    };
  });
};

// Aggregate data based on day scale
const aggregateDataByScale = (data: any[], dayScale: DayScale) => {
  if (dayScale === '1D' || !data || data.length === 0) {
    return data; // Return daily data as is
  }
  
  const aggregatedData = new Map();
  
  data.forEach(item => {
    const date = new Date(item.date);
    let key;
    
    if (dayScale === '1W') {
      // Get the start of the week (Sunday)
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - dayOfWeek);
      key = startOfWeek.toISOString().split('T')[0];
    } else if (dayScale === '1M') {
      // Get the start of the month
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    }
    
    if (!aggregatedData.has(key)) {
      aggregatedData.set(key, {
        date: key,
        positive: 0,
        negative: 0,
        rawPnl: 0,
        count: 0
      });
    }
    
    const entry = aggregatedData.get(key);
    const pnlValue = item.rawPnl || (item.positive - item.negative) || 0;
    
    entry.rawPnl += pnlValue;
    entry.count += 1;
  });
  
  // Convert aggregated data back to array and calculate positive/negative values
  return Array.from(aggregatedData.values()).map(item => {
    const { rawPnl, date, count } = item;
    return {
      date,
      positive: rawPnl > 0 ? rawPnl : 0,
      negative: rawPnl < 0 ? rawPnl : 0,
      rawPnl,
      count
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const PortfolioPnL = memo(({ data }: PortfolioPnLProps) => {
  const isProfit = data.total > 0;
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [dayScale, setDayScale] = useState<DayScale>('1D');
  const [pnlMode, setPnlMode] = useState<PnLMode>('daily');
  const [chartData, setChartData] = useState<any[]>([]);
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);
  const [totalPnlData, setTotalPnlData] = useState<{pnl: number, pnlPercentage: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  
  // Fetch overall PnL data (for the header)
  useEffect(() => {
    if (!data.agentId) {
      return;
    }
    
    const fetchTotalPnL = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
        const apiKey = process.env.API_KEY || 'secret';
        
        const response = await fetch(
          `${apiUrl}/api/kpi/pnl/${data.agentId}`,
          {
            headers: {
              'x-api-key': apiKey,
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Total PnL data:', result);
        
        setTotalPnlData({
          pnl: result.pnl,
          pnlPercentage: result.pnlPercentage
        });
      } catch (error) {
        console.error('Error fetching total PnL data:', error);
        // Fall back to prop data
        setTotalPnlData(null);
      }
    };
    
    fetchTotalPnL();
  }, [data.agentId]);
  
  // Fetch daily PnL data based on the selected time range
  useEffect(() => {
    const fetchPnLData = async () => {
      if (!data.agentId) {
        // If no agentId, use fallback data
        const fallbackData = data.monthly.map(item => ({
          date: item.date,
          positive: item.value > 0 ? item.value : 0,
          negative: item.value < 0 ? item.value : 0,
          rawPnl: item.value
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
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8080';
        const apiKey = process.env.API_KEY || 'secret';
        
        console.log(`Fetching PnL data for agent ${data.agentId} from ${fromDate} to ${toDate}`);
        
        const response = await fetch(
          `${apiUrl}/api/performance/${data.agentId}/history?interval=daily&from=${fromDate}&to=${toDate}`,
          {
            headers: {
              'x-api-key': apiKey,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Daily PnL API Response:', result);
        
        // Store raw API response for debugging/analysis
        setApiResponse(result);
        
        if (!result.snapshots || !Array.isArray(result.snapshots) || result.snapshots.length === 0) {
          console.warn('No snapshots found in API response');
          setError('No performance data available for the selected time period');
          return;
        }
        
        // Process the API response data
        const processPnLData = () => {
          // Log entire snapshots array to debug
          console.log('Raw snapshots array:', JSON.stringify(result.snapshots));
          
          // 1. First, create an array sorted by date
          const sortedSnapshots = [...result.snapshots].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          // 2. Generate data based on selected PnL mode
          if (pnlMode === 'daily') {
            // Daily mode: Calculate day-to-day changes
            return sortedSnapshots.map((snapshot, index, array) => {
              const date = new Date(snapshot.timestamp).toISOString().split('T')[0];
              
              // Log individual snapshot data for debugging
              console.log(`Snapshot ${index} (${date})`, {
                pnl: snapshot.pnl,
                pnl24h: snapshot.pnl24h,
                balanceInUSD: snapshot.balanceInUSD
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
                  isActualData: true
                };
              }
              
              // Second, if no pnl24h, try to calculate from cumulative PnL
              // by comparing with the previous day
              if (index > 0 && typeof snapshot.pnl === 'number' && typeof array[index - 1].pnl === 'number') {
                const pnlValue = snapshot.pnl - array[index - 1].pnl;
                return {
                  date,
                  positive: pnlValue > 0 ? pnlValue : 0,
                  negative: pnlValue < 0 ? pnlValue : 0,
                  rawPnl: pnlValue,
                  source: 'calculated', // Track where value came from
                  isActualData: true
                };
              }
              
              // Third, if no pnl, try to calculate from balance changes
              if (index > 0 && 
                  typeof snapshot.balanceInUSD === 'number' && 
                  typeof array[index - 1].balanceInUSD === 'number') {
                const pnlValue = snapshot.balanceInUSD - array[index - 1].balanceInUSD;
                return {
                  date,
                  positive: pnlValue > 0 ? pnlValue : 0,
                  negative: pnlValue < 0 ? pnlValue : 0,
                  rawPnl: pnlValue,
                  source: 'balance', // Track where value came from
                  isActualData: true
                };
              }
              
              // Fallback: use a zero value if we can't determine the PnL
              return {
                date,
                positive: 0,
                negative: 0,
                rawPnl: 0,
                source: 'fallback', // Track where value came from
                isActualData: false
              };
            });
          } else {
            // Cumulative mode: Use the running total PnL
            return sortedSnapshots.map((snapshot, index) => {
              const date = new Date(snapshot.timestamp).toISOString().split('T')[0];
              
              // Use the cumulative PnL value directly
              const pnlValue = typeof snapshot.pnl === 'number' ? snapshot.pnl : 0;
              
              return {
                date,
                positive: pnlValue > 0 ? pnlValue : 0,
                negative: pnlValue < 0 ? pnlValue : 0,
                rawPnl: pnlValue,
                source: 'cumulative' // Track where value came from
              };
            });
          }
        };
        
        const pnlData = processPnLData();
        
        // Make sure we have data for every day in the range if requested
        const allDates = generateDatesBetween(startDate, now);
        const dateMap = new Map();
        
        // Create a map of existing dates
        pnlData.forEach((item: { date: string; positive: number; negative: number; rawPnl: number }) => {
          dateMap.set(item.date, item);
        });
        
        // Generate the complete data set with all dates
        const completeData = allDates.map(date => {
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
            isEmpty: true
          };
        });
        
        // Sort by date
        completeData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
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
  }, [timeRange, pnlMode, data.agentId, data.monthly]);

  // Aggregate chart data based on day scale when chartData or dayScale changes
  useEffect(() => {
    setAggregatedData(aggregateDataByScale(chartData, dayScale));
  }, [chartData, dayScale]);

  // Calculate max and min values for chart scaling
  const maxValue = useMemo(() => {
    if (!aggregatedData.length) return 100;
    const max = Math.max(...aggregatedData.map(item => Math.max(item.positive || 0, Math.abs(item.negative || 0))));
    return max > 0 ? max : 100;
  }, [aggregatedData]);

  // Get total PnL values, prioritizing API fetched data
  const displayPnl = totalPnlData?.pnl !== undefined ? totalPnlData.pnl : data.total;
  const displayPercentage = totalPnlData?.pnlPercentage !== undefined ? totalPnlData.pnlPercentage : data.percentage;
  const isDisplayPnlProfit = displayPnl >= 0;

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
            isDisplayPnlProfit ? 'bg-green-500/20' : 'bg-red-500/20'
          )}
        >
          <DollarSign
            className={cn(
              'h-6 w-6',
              isDisplayPnlProfit ? 'text-green-400' : 'text-red-400'
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
                isDisplayPnlProfit ? 'text-green-400' : 'text-red-400'
              )}
            >
              {isDisplayPnlProfit ? '+' : '-'}$
              {Math.abs(displayPnl).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span
              className={cn(
                'text-sm font-mono',
                isDisplayPnlProfit ? 'text-green-400/70' : 'text-red-400/70'
              )}
            >
              ({isDisplayPnlProfit ? '+' : ''}
              {displayPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </motion.div>

      {/* Control bar with Time Range, Day Scale, and PnL Mode */}
      <div className="flex flex-col md:flex-row justify-between gap-2 mb-2">
        {/* Top row controls */}
        <div className="flex justify-between md:justify-start gap-2">
          {/* PnL Mode Toggle */}
          <div className="flex bg-[#232229] rounded-lg p-1 border border-gray-800">
            <Button
              size="sm"
              variant={pnlMode === 'daily' ? 'default' : 'ghost'}
              className={cn(
                'text-xs h-7 px-3',
                pnlMode === 'daily'
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
              onClick={() => setPnlMode('daily')}
            >
              Daily Changes
            </Button>
            <Button
              size="sm"
              variant={pnlMode === 'cumulative' ? 'default' : 'ghost'}
              className={cn(
                'text-xs h-7 px-3',
                pnlMode === 'cumulative'
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
              onClick={() => setPnlMode('cumulative')}
            >
              Cumulative
            </Button>
          </div>
          
          {/* Day Scale Selector */}
          <div className="flex bg-[#232229] rounded-lg p-1 border border-gray-800">
            {(['1D', '1W', '1M'] as const).map((scale) => (
              <Button
                key={scale}
                size="sm"
                variant={dayScale === scale ? 'default' : 'ghost'}
                className={cn(
                  'text-xs h-7 px-3',
                  dayScale === scale
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
                onClick={() => setDayScale(scale)}
              >
                {scale === '1D' ? 'Daily' : scale === '1W' ? 'Weekly' : 'Monthly'}
              </Button>
            ))}
          </div>
        </div>
        
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
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* P&L Chart */}
      <motion.div
        className="bg-[#232229] rounded-xl p-4 border border-gray-800 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="text-sm font-medium mb-3 text-gray-300">
          {pnlMode === 'daily' ? 'Daily P&L' : 'Cumulative P&L'} ({timeRange === '1W' ? 'Last 7 Days' : 
                      timeRange === '1M' ? 'Last 30 Days' : 
                      timeRange === '3M' ? 'Last 3 Months' : 'All Time'})
          {dayScale !== '1D' && 
            <span className="ml-2 text-xs text-gray-400">
              ({dayScale === '1W' ? 'Weekly' : 'Monthly'} aggregation)
            </span>
          }
          {apiResponse && apiResponse.snapshots && 
            <span className="ml-2 text-xs text-gray-400">
              (Based on {apiResponse.snapshots.length} data point{apiResponse.snapshots.length !== 1 ? 's' : ''})
            </span>
          }
          {aggregatedData.length === 0 && !isLoading && !error && (
            <span className="ml-2 text-xs text-gray-400">
              (No data available for the selected period)
            </span>
          )}
        </h3>
        {apiResponse && apiResponse.snapshots && apiResponse.snapshots.length <= 3 && (
          <div className="mb-4 px-3 py-2 bg-blue-900/20 border border-blue-800/30 rounded-md text-sm text-blue-300">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span className="font-medium">Limited Data Available</span>
            </div>
            <p className="text-xs ml-6">
              Your chart is based on {apiResponse.snapshots.length} data point{apiResponse.snapshots.length !== 1 ? 's' : ''}.
              As more trading activity occurs, your visualization will become more detailed.
            </p>
          </div>
        )}
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333340" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => formatDate(date, dayScale)}
                  tick={{ fontSize: 12, fontFamily: 'monospace', fill: '#9CA3AF' }}
                  tickLine={false}
                  axisLine={{ stroke: '#333340' }}
                  interval={dayScale === '1D' ? 'preserveStartEnd' : 0}
                />
                <YAxis
                  tickCount={5}
                  tick={{ fontSize: 12, fontFamily: 'monospace', fill: '#9CA3AF' }}
                  tickFormatter={(value) => `${value >= 0 ? '' : '-'}$${Math.abs(value).toFixed(1)}`}
                  tickLine={false}
                  axisLine={false}
                  domain={pnlMode === 'daily' ? [-(maxValue * 0.5), maxValue] : ['auto', 'auto']}
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
                  maxBarSize={dayScale === '1D' ? 20 : dayScale === '1W' ? 40 : 60}
                />
                {/* Negative values (red bars) with better styling */}
                <Bar
                  dataKey="negative"
                  name="Loss"
                  fill="#EF4444"
                  fillOpacity={0.9}
                  strokeOpacity={1}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={dayScale === '1D' ? 20 : dayScale === '1W' ? 40 : 60}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* API Data Debug Info - only in development */}
        {process.env.NODE_ENV === 'development' && apiResponse && (
          <div className="mt-4 p-2 border border-gray-700 rounded text-xs text-gray-400 overflow-auto max-h-32">
            <details>
              <summary>API Response Debug Info</summary>
              <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
            </details>
          </div>
        )}
      </motion.div>
    </div>
  );
});

PortfolioPnL.displayName = 'PortfolioPnL';

export default PortfolioPnL; 