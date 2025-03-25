'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';
import { Cabin_Sketch } from 'next/font/google';

const cabinSketch = Cabin_Sketch({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
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
        <h3 className={`${cabinSketch.className} text-2xl text-muted-foreground`}>{title}</h3>
        <div className="p-2 bg-white/5 rounded-lg text-3xl">{icon}</div>
      </div>
      <div className="font-mono text-2xl font-bold mb-1">{value}</div>
      <div className={`text-xs font-mono flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <span className="mr-1">{isPositive ? '↑' : '↓'}</span>
        {change}
      </div>
    </motion.div>
  );
};

export default memo(StatCard); 