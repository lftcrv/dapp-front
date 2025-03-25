'use client';

import StatCard from '@/components/ui/stat-card';

export default function StatsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      <StatCard
        title="Total Tx"
        value="$68,439"
        change="8.5% Up from past week"
        icon="💸"
      />
      <StatCard
        title="TVL"
        value="$40,689"
        change="1.3% Up from past week"
        icon="💰"
      />
      <StatCard
        title="Best PNL"
        value="49%"
        change="4.3% Down from yesterday"
        icon="🚀"
        isPositive={false}
      />
      <StatCard
        title="Total agents"
        value="109"
        change="1.8% Up from yesterday"
        icon="👨‍👨‍👦‍👦"
      />
    </div>
  );
} 