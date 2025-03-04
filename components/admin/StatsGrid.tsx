import React from 'react';
import StatCard from './StatCard';
import { AccessCodeDashboard } from '../../types/accessCode';

interface StatsGridProps {
  stats?: AccessCodeDashboard['stats'];
  isLoading?: boolean;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  // Provide default values if stats are undefined
  const safeStats = stats || {
    totalCodes: 0,
    activeCodes: 0,
    usedCodes: 0,
    expiringCodes: 0
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Codes"
        value={safeStats.totalCodes}
        description="Total number of access codes"
      />
      <StatCard
        title="Active Codes"
        value={safeStats.activeCodes}
        description="Currently active access codes"
      />
      <StatCard
        title="Used Codes"
        value={safeStats.usedCodes}
        description="Access codes that have been used"
      />
      <StatCard
        title="Expiring Soon"
        value={safeStats.expiringCodes}
        description="Codes expiring in the next 7 days"
      />
    </div>
  );
};

export default StatsGrid; 