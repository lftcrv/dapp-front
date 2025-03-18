'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
}

interface PortfolioPnLProps {
  data: PnLData;
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
        <p className={cn(
          "font-mono text-lg flex items-center gap-1",
          isProfit ? "text-green-400" : "text-red-400"
        )}>
          {isProfit ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          Ξ{Math.abs(value).toLocaleString(undefined, {
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

const PortfolioPnL = memo(({ data }: PortfolioPnLProps) => {
  const isProfit = data.total > 0;
  
  // Prepare data for separate positive and negative bars
  const chartData = useMemo(() => {
    return data.monthly.map(item => ({
      date: item.date,
      positive: item.value > 0 ? item.value : 0,
      negative: item.value < 0 ? item.value : 0,
    }));
  }, [data.monthly]);

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
            isProfit ? 'bg-green-500/20' : 'bg-red-500/20'
          )}
        >
          <DollarSign
            className={cn(
              'h-6 w-6',
              isProfit ? 'text-green-400' : 'text-red-400'
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
                isProfit ? 'text-green-400' : 'text-red-400'
              )}
            >
              {isProfit ? '+' : '-'}Ξ
              {Math.abs(data.total).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span
              className={cn(
                'text-sm font-mono',
                isProfit ? 'text-green-400/70' : 'text-red-400/70'
              )}
            >
              ({isProfit ? '+' : ''}
              {data.percentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </motion.div>

      {/* P&L Chart */}
      <motion.div
        className="bg-[#232229] rounded-xl p-4 border border-gray-800 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h3 className="text-sm font-medium mb-3 text-gray-300">Daily P&L (Last 30 Days)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333340" />
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
                tickFormatter={(value) => `${value >= 0 ? '' : '-'}Ξ${Math.abs(value).toFixed(1)}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#4B5563" />
              {/* Positive values (green bars) */}
              <Bar
                dataKey="positive"
                name="Profit"
                fill="#22C55E"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
              {/* Negative values (red bars) */}
              <Bar
                dataKey="negative"
                name="Loss"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
});

PortfolioPnL.displayName = 'PortfolioPnL';

export default PortfolioPnL; 