'use client';

import { useCallback, useEffect, useState } from 'react';
import StatCard from '@/components/ui/stat-card';
import { getAllGlobalMetrics } from '@/actions/metrics/global/getAllGlobalMetrics';
import { GlobalMetrics } from '@/lib/types/metrics';
import { RefreshCw } from 'lucide-react';
import { getTopPerformingAgent } from '@/actions/agents/query/getTopPerformingAgent';
import { Agent } from '@/lib/types';

export default function StatsSection() {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [topAgent, setTopAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Format dollar values with commas
  const formatDollar = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  // Format percentage values
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch global metrics
      const metricsResult = await getAllGlobalMetrics();
      
      if (metricsResult.success && metricsResult.data) {
        setMetrics(metricsResult.data);
        setError(null);
      } else {
        setError(metricsResult.error || 'Failed to load metrics');
      }

      // Fetch top performing agent by PnL rank
      const topAgentResult = await getTopPerformingAgent();
      
      if (topAgentResult.success && topAgentResult.data) {
        setTopAgent(topAgentResult.data);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
    
    // Optional: Set up polling for real-time updates
    // const intervalId = setInterval(fetchData, 30000); // Refresh every 30 seconds
    // return () => clearInterval(intervalId);
  }, [fetchData]);

  // Format the last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return "Not updated yet";
    
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diffSeconds < 60) return `Updated ${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `Updated ${Math.floor(diffSeconds / 60)}m ago`;
    return `Updated ${Math.floor(diffSeconds / 3600)}h ago`;
  };

  // Show loading state if initial load
  if (isLoading && !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white rounded-lg shadow-sm animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Platform Statistics</h2>
        <button 
          onClick={fetchData} 
          disabled={isLoading}
          className="text-sm flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tx"
          value={error ? "Error" : metrics?.totalTradeCount.toString() || "0"}
          change={error ? error : getLastUpdatedText()}
          icon="💸"
          isPositive={!error}
        />
        <StatCard
          title="Best PnL"
          value={error ? "Error" : topAgent && typeof topAgent.pnlCycle === 'number' ? formatPercentage(topAgent.pnlCycle) : "0%"}
          change={error ? error : topAgent ? topAgent.name : "No agents yet"}
          icon="💰"
          isPositive={topAgent && typeof topAgent.pnlCycle === 'number' ? topAgent.pnlCycle >= 0 : true}
        />
        <StatCard
          title="Total Balance"
          value={error ? "Error" : formatDollar(metrics?.totalBalance || 0)}
          change={error ? error : getLastUpdatedText()}
          icon="💵"
          isPositive={!error}
        />
        <StatCard
          title="Total Agents"
          value={error ? "Error" : metrics?.totalAgentCount.toString() || "0"}
          change={error ? error : getLastUpdatedText()}
          icon="👨‍👨‍👦‍👦"
          isPositive={!error}
        />
      </div>
    </div>
  );
}
