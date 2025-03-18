'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { memo } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  isPositive?: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  isPositive = true 
}: StatCardProps) => {
  return (
    <motion.div 
      className="bg-[#F6ECE7] border border-black/30 rounded-xl p-4 flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs text-muted-foreground font-mono">{title}</h3>
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <div className="font-mono text-2xl font-bold mb-1">{value}</div>
      <div className={`text-xs font-mono flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <TrendingUp className={`h-3 w-3 mr-1 ${!isPositive && 'rotate-180'}`} />
        {change}
      </div>
    </motion.div>
  );
};

export default memo(StatCard); 