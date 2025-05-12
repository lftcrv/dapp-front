'use client';

import { memo } from 'react';
import { Agent, Trade } from '@/lib/types';
import SimpleAgentCard from '@/components/agent/simple-agent-card';
import PortfolioStats from '@/components/agent/portfolio-stats';
import PortfolioChart from '@/components/agent/portfolio-chart';
import PortfolioPnL from '@/components/agent/portfolio-pnl';
import PortfolioAllocation from '@/components/agent/portfolio-allocation';
import SectionCard from '@/components/ui/section-card';
import dynamic from 'next/dynamic';

// Dynamically import AgentTrades to prevent hydration issues
const AgentTrades = dynamic(() => import('@/components/agent/agent-trades'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  ),
});

interface PortfolioData {
  totalValue: number;
  change24h: number;
  changeValue24h: number;
  allocation: Array<{
    asset: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  historicalData: Array<{
    date: string;
    value: number;
  }>;
  pnlData: {
    total: number;
    percentage: number;
    monthly: Array<{
      date: string;
      value: number;
    }>;
  };
  totalTrades: number;
  forkingRevenue: number;
}

interface AgentPortfolioProps {
  agent: Agent;
  trades: Trade[];
  portfolio: PortfolioData;
  useSimplifiedView?: boolean;
}

export const AgentPortfolio = memo(
  ({
    agent,
    trades,
    portfolio,
    useSimplifiedView = false,
  }: AgentPortfolioProps) => {
    // Format the creation date for display
    const createdDate = new Date(agent.createdAt || Date.now());
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(createdDate);

    return (
      <div className="space-y-6">
        {/* Agent Card */}
        <SimpleAgentCard
          agent={agent}
          created={formattedDate}
          by={agent.creatorWallet || agent.creator}
        />

        {/* Only show the rest of the components if we're not using the simplified view */}
        {!useSimplifiedView && (
          <>
            {/* Stats Cards (Ranking, Trades, Forking Revenue) */}
            <SectionCard title="Performance Overview" icon="📊" iconColor="text-yellow-500">
              <PortfolioStats
                cycleRanking={agent.cycleRanking}
                totalTrades={portfolio.totalTrades}
                forkingRevenue={portfolio.forkingRevenue}
                agentType={agent.type}
              />
            </SectionCard>

            {/* Portfolio Value Chart and P&L side by side on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Portfolio Value Chart */}
              <SectionCard title="Portfolio Evolution" icon="📈" iconColor="text-green-600">
                <PortfolioChart
                  data={portfolio.historicalData}
                  totalValue={portfolio.totalValue}
                  change24h={portfolio.change24h}
                  changeValue24h={portfolio.changeValue24h}
                  agentId={agent.id}
                />
              </SectionCard>

              {/* Portfolio P&L */}
              <SectionCard title="Profit & Loss" icon="💰" iconColor="text-blue-600">
                <PortfolioPnL data={portfolio.pnlData} agentId={agent.id} />
              </SectionCard>
            </div>

            {/* Portfolio Allocation */}
            <SectionCard title="Asset Allocation" icon="🧩" iconColor="text-purple-600">
              <PortfolioAllocation allocation={portfolio.allocation} />
            </SectionCard>

            {/* Trade History */}
            <SectionCard title="Trade History" icon="📜" iconColor="text-orange-600">
              <AgentTrades agentId={agent.id} trades={trades} />
            </SectionCard>
          </>
        )}
      </div>
    );
  },
);

AgentPortfolio.displayName = 'AgentPortfolio';
