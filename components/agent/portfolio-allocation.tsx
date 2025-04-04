'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AllocationItem {
  asset: string;
  value: number;
  percentage: number;
  color: string;
}

interface PortfolioAllocationProps {
  allocation: AllocationItem[];
}

// Format data for the pie chart
const formatData = (allocation: AllocationItem[]) => {
  return allocation.map((item) => ({
    name: item.asset,
    value: item.value,
    percentage: item.percentage,
    color: item.color,
  }));
};

// Format large numbers for display
const formatValue = (value: number) => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

// Custom tooltip for the pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#232229] p-3 rounded-lg shadow-lg border border-gray-700 text-white">
        <div className="font-medium text-white">{data.name}</div>
        <div className="font-mono text-white">
          ${data.value.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
        <div className="text-sm text-gray-400">
          {data.percentage.toFixed(1)}% of portfolio
        </div>
      </div>
    );
  }
  return null;
};

const PortfolioAllocation = memo(({ allocation }: PortfolioAllocationProps) => {
  const data = formatData(allocation);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pie Chart */}
        <motion.div
          className="bg-[#232229] rounded-xl p-4 border border-gray-800 col-span-1 md:col-span-1 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-sm font-medium mb-3 text-center text-gray-300">Asset Allocation</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  dataKey="value"
                  labelLine={false}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={activeIndex === index ? '#fff' : 'none'}
                      strokeWidth={activeIndex === index ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) => {
                    return (
                      <span className="text-xs font-medium text-gray-300">{value}</span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Allocation Table */}
        <motion.div
          className="bg-[#232229] rounded-xl p-4 border border-gray-800 col-span-1 md:col-span-2 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-sm font-medium mb-3 text-gray-300">Detailed Breakdown</h3>
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-400 py-2">Asset</th>
                  <th className="text-right text-xs font-medium text-gray-400 py-2">Value</th>
                  <th className="text-right text-xs font-medium text-gray-400 py-2">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {allocation.map((item, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "border-t border-gray-800",
                      activeIndex === index && "bg-gray-800/50"
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <td className="py-3 flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-white">{item.asset}</span>
                    </td>
                    <td className="py-3 text-right font-mono text-white">
                      ${formatValue(item.value)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end">
                        <div className="w-16 bg-gray-800 h-2 rounded-full overflow-hidden mr-2">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs text-gray-300">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-700">
                  <td className="pt-3 font-medium text-white">Total</td>
                  <td className="pt-3 text-right font-mono font-medium text-white">
                    ${formatValue(
                      allocation.reduce((sum, item) => sum + item.value, 0)
                    )}
                  </td>
                  <td className="pt-3 text-right font-mono font-medium text-white">
                    100%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

PortfolioAllocation.displayName = 'PortfolioAllocation';

export default PortfolioAllocation; 