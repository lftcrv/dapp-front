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

    // Filter data based on selected time range
    const filteredData = () => {
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