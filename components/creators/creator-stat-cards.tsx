'use client';

import { TrendingUp, Users, BarChart, RotateCcw } from 'lucide-react';
import { Agent } from '@/lib/types';

interface CreatorStatsProps {
  stats: {
    totalAgents: number;
    runningAgents: number;
    totalPnl: number;
    totalTrades: number;
    bestAgent: Agent | null;
  };
}

// Format currency values nicely
function formatCurrency(amount: number, compact = false) {
  if (compact && Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'always',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}k`;
  }
  
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CreatorStatCards({ stats }: CreatorStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Agents Card */}
      <div className="bg-white/30 rounded-lg p-4 shadow-sm border border-gray-200/30">
        <div className="flex items-center mb-2">
          <div className="p-2 rounded-full bg-blue-100 mr-3">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-medium">Total Agents</h3>
        </div>
        <p className="text-2xl font-semibold">{stats.totalAgents}</p>
        <p className="text-sm text-muted-foreground">
          {stats.runningAgents} Active Agent{stats.runningAgents !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Total Trades Card */}
      <div className="bg-white/30 rounded-lg p-4 shadow-sm border border-gray-200/30">
        <div className="flex items-center mb-2">
          <div className="p-2 rounded-full bg-purple-100 mr-3">
            <RotateCcw className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-medium">Total Trades</h3>
        </div>
        <p className="text-2xl font-semibold">{stats.totalTrades.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">
          Across all agents
        </p>
      </div>
      
      {/* Total PnL Card */}
      <div className="bg-white/30 rounded-lg p-4 shadow-sm border border-gray-200/30">
        <div className="flex items-center mb-2">
          <div className="p-2 rounded-full bg-green-100 mr-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-medium">Total PnL</h3>
        </div>
        <p className={`text-2xl font-semibold ${stats.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(stats.totalPnl, true)}
        </p>
        <p className="text-sm text-muted-foreground">
          Overall performance
        </p>
      </div>
      
      {/* Best Agent Card */}
      <div className="bg-white/30 rounded-lg p-4 shadow-sm border border-gray-200/30">
        <div className="flex items-center mb-2">
          <div className="p-2 rounded-full bg-orange-100 mr-3">
            <BarChart className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-medium">Best Agent</h3>
        </div>
        {stats.bestAgent ? (
          <>
            <p className="text-xl font-semibold truncate" title={stats.bestAgent.name}>
              {stats.bestAgent.name}
            </p>
            <p className="text-sm text-muted-foreground">
              PnL: {formatCurrency(stats.bestAgent.pnlCycle || 0)}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No agents available</p>
        )}
      </div>
    </div>
  );
} 