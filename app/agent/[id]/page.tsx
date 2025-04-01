import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { getCompleteAgentData } from '@/actions/agents/token/getTokenInfo';
import { tradeService } from '@/lib/services/api/trades';
import { AgentPortfolio } from '@/components/agent/agent-portfolio';
import Image from 'next/image';
import { getAgentTradeCount } from '@/actions/metrics/agent/getAgentTradeCount';
import { getPortfolioValue } from '@/actions/agents/portfolio/getPortfolioValue';
import { getAssetAllocation } from '@/actions/agents/portfolio/getAssetAllocation';
import { getPerformanceMetrics } from '@/actions/agents/portfolio/getPerformanceMetrics';
import { getPortfolioHistory } from '@/actions/agents/portfolio/getPortfolioHistory';
import { getBalanceHistory } from '@/actions/agents/portfolio/getBalanceHistory';
import { getCurrentBalance } from '@/actions/agents/portfolio/getCurrentBalance';

// Mark this page as dynamic to skip static build
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable static page generation

// Cache the getPageData function with a 5-second revalidation
const getCachedPageData = unstable_cache(
  async (agentId: string) => {
    // Get all agent data in a single call
    const agentResult = await getCompleteAgentData(agentId);
    if (!agentResult.success || !agentResult.data) {
      console.error('❌ Failed to fetch agent:', agentResult.error);
      return { error: agentResult.error || 'Agent not found' };
    }

    // Add a mock description for the agent for demonstration purposes
    if (agentResult.data && !agentResult.data.description) {
      agentResult.data.description =
        agentResult.data.type === 'leftcurve'
          ? 'A degen trading agent focused on high-risk, high-reward strategies. Always looking for the next moonshot and not afraid to YOLO into promising opportunities. Known for its bold trades and occasional spectacular wins.'
          : 'A disciplined sigma trading agent with a proven track record of consistent returns. Follows a quantitative approach with sophisticated risk management protocols. Specializes in market inefficiencies and technical analysis.';
    }

    // Get trades separately as they're not part of the agent endpoint
    const tradesResult = await tradeService.getByAgent(agentId);

    // Fetch agent-specific metrics and portfolio data
    const [
      tradeCountResult,
      portfolioValueResult,
      assetAllocationResult,
      performanceMetricsResult,
      portfolioHistoryResult,
      balanceHistoryResult,
      currentBalanceResult
    ] = await Promise.all([
      getAgentTradeCount(agentId),
      getPortfolioValue(agentId),
      getAssetAllocation(agentId),
      getPerformanceMetrics(agentId),
      getPortfolioHistory(agentId, { interval: 'daily' }),
      getBalanceHistory(agentId),
      getCurrentBalance(agentId)
    ]);

    // Build real portfolio data from API responses
    const portfolioData = {
      totalValue: currentBalanceResult.success && currentBalanceResult.data?.currentBalance ? currentBalanceResult.data.currentBalance : 0,
      change24h: performanceMetricsResult.success && performanceMetricsResult.data?.dailyPnL ? performanceMetricsResult.data.dailyPnL : 0,
      changeValue24h: portfolioValueResult.success && portfolioValueResult.data?.pnl ? portfolioValueResult.data.pnl : 0,
      
      // Asset allocation data
      allocation: assetAllocationResult.success && assetAllocationResult.data?.assets 
        ? assetAllocationResult.data.assets.map(asset => ({
            asset: asset.symbol,
            value: asset.value,
            percentage: asset.percentage,
            color: getAssetColor(asset.symbol) // Helper function to assign colors
          }))
        : [],
      
      // Historical data from portfolio history
      historicalData: portfolioHistoryResult.success && portfolioHistoryResult.data?.snapshots
        ? portfolioHistoryResult.data.snapshots.map(snapshot => ({
            date: snapshot.timestamp.split('T')[0],
            value: snapshot.balanceInUSD
          }))
        : [],
      
      // PnL data
      pnlData: {
        total: portfolioValueResult.success && portfolioValueResult.data?.pnl ? portfolioValueResult.data.pnl : 0,
        percentage: portfolioValueResult.success && portfolioValueResult.data?.pnlPercentage ? portfolioValueResult.data.pnlPercentage : 0,
        monthly: portfolioHistoryResult.success && portfolioHistoryResult.data?.snapshots
          ? portfolioHistoryResult.data.snapshots.map(snapshot => ({
              date: snapshot.timestamp.split('T')[0],
              value: snapshot.pnl
            }))
          : [],
      },
      
      // Other metrics (some still mocked until API endpoints are available)
      ranking: {
        global: 17, // Mock data - API doesn't provide this yet
        category: 5, // Mock data - API doesn't provide this yet
        change: 3,  // Mock data - API doesn't provide this yet
      },
      
      totalTrades: tradeCountResult.success && tradeCountResult.data?.tradeCount ? tradeCountResult.data.tradeCount : 0,
      forkingRevenue: 1258.42, // Mock data - API doesn't provide this yet
    };

    return {
      agent: agentResult.data,
      trades: tradesResult.success && tradesResult.data ? tradesResult.data : [],
      portfolio: portfolioData,
    };
  },
  ['agent-portfolio-page-data'],
  {
    revalidate: 5,
    tags: ['agent-data'],
  },
);

// Helper function to assign colors to assets
function getAssetColor(symbol: string): string {
  const colorMap: Record<string, string> = {
    'ETH': '#627EEA',
    'WETH': '#627EEA',
    'BTC': '#F7931A',
    'WBTC': '#F7931A',
    'USDC': '#2775CA',
    'USDT': '#26A17B',
    'DAI': '#F5AC37',
    'STRK': '#FF4C8B',
    'PEPE': '#52B788',
    'SHIB': '#FFA409',
    'ARB': '#28A0F0',
    'OP': '#FF0420'
  };
  
  return colorMap[symbol] || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AgentPortfolioPage(props: PageProps) {
  const { params, searchParams } = props;
  
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  
  if (!resolvedParams.id) {
    notFound();
  }

  const { agent, trades, portfolio, error } = await getCachedPageData(
    resolvedParams.id,
  );

  if (error || !agent) {
    notFound();
  }

  // Check if simplified view is requested via URL param
  const simplified = resolvedSearchParams?.simplified;
  const useSimplifiedView = simplified === 'true' || (Array.isArray(simplified) && simplified[0] === 'true');

  return (
    <main className="flex min-h-screen flex-col relative">
      {/* Background image */}
      <div className="fixed inset-0 z-0 w-screen h-screen">
        <Image
          src="/Group 5749-min.jpg"
          alt="Background Pattern"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Gradient overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-orange-600/30 via-transparent to-purple-600/30 pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 py-6 pt-28 relative z-10">
        {/* Display the portfolio components */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          }
        >
          <AgentPortfolio
            agent={agent}
            trades={trades}
            portfolio={portfolio}
            useSimplifiedView={useSimplifiedView}
          />
        </Suspense>
      </div>
    </main>
  );
}
