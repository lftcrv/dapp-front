import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { getCompleteAgentData } from '@/actions/agents/token/getTokenInfo';
import { tradeService } from '@/lib/services/api/trades';
import { AgentPortfolio } from '@/components/agent/agent-portfolio';
import Image from 'next/image';
import { getAgentTradeCount } from '@/actions/metrics/agent';
import {
  getPortfolioValue,
  getPerformanceMetrics,
  getPortfolioHistory,
  getBalanceHistory,
  getCurrentBalance,
} from '@/actions/agents/portfolio';
import {
  AgentTradeCount as AgentTradeCountType,
  CurrentBalance,
  PnLResponse,
  PerformanceMetrics as PerformanceMetricsType,
  PerformanceHistory,
  BalanceHistory,
} from '@/lib/types';

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
      performanceMetricsResult,
      portfolioHistoryResult,
      balanceHistoryResult,
      currentBalanceResult,
    ] = await Promise.all([
      getAgentTradeCount(agentId),
      getPortfolioValue(agentId),
      getPerformanceMetrics(agentId),
      getPortfolioHistory(agentId, { interval: 'daily' }),
      getBalanceHistory(agentId),
      getCurrentBalance(agentId),
    ]);

    // Helper function to get values safely
    const getSafeValue = <T, K>(
      result: { success: boolean; data?: T },
      valueGetter: (data: T) => K,
      defaultValue: K,
    ): K => {
      if (!result.success || !result.data) return defaultValue;
      try {
        return valueGetter(result.data);
      } catch {
        return defaultValue;
      }
    };

    // Build real portfolio data from API responses
    const portfolioData = {
      totalValue: getSafeValue<CurrentBalance, number>(
        currentBalanceResult,
        (data) => data.currentBalance,
        0,
      ),

      change24h: getSafeValue<PerformanceMetricsType, number>(
        performanceMetricsResult,
        (data) => data.dailyPnL,
        0,
      ),

      changeValue24h: getSafeValue<PnLResponse, number>(
        portfolioValueResult,
        (data) => data.pnl,
        0,
      ),
      
      // Empty allocation array since we're using a dedicated component now
      allocation: [],

      // Historical data from portfolio history
      historicalData: getSafeValue<
        BalanceHistory,
        Array<{ date: string; value: number }>
      >(
        balanceHistoryResult,
        (data) =>
          data.balances.map((item) => ({
            date: item.createdAt.split('T')[0],
            value: item.balanceInUSD,
          })),
        // Fall back to performance history if balance history not available
        getSafeValue<
          PerformanceHistory,
          Array<{ date: string; value: number }>
        >(
          portfolioHistoryResult,
          (data) =>
            data.snapshots.map((snapshot) => ({
              date: snapshot.timestamp.split('T')[0],
              value: snapshot.balanceInUSD,
            })),
          [],
        ),
      ),

      // PnL data
      pnlData: {
        total: getSafeValue<PnLResponse, number>(
          portfolioValueResult,
          (data) => data.pnl,
          0,
        ),

        percentage: getSafeValue<PnLResponse, number>(
          portfolioValueResult,
          (data) => data.pnlPercentage,
          0,
        ),

        monthly: getSafeValue<
          PerformanceHistory,
          Array<{ date: string; value: number }>
        >(
          portfolioHistoryResult,
          (data) =>
            data.snapshots.map((snapshot) => ({
              date: snapshot.timestamp.split('T')[0],
              value: snapshot.pnl,
            })),
          [],
        ),
      },

      // Other metrics (some still mocked until API endpoints are available)
      ranking: {
        global: 17, // Mock data - API doesn't provide this yet
        category: 5, // Mock data - API doesn't provide this yet
        change: 3, // Mock data - API doesn't provide this yet
      },

      totalTrades: getSafeValue<AgentTradeCountType, number>(
        tradeCountResult,
        (data) => data.tradeCount,
        0,
      ),

      forkingRevenue: 1258.42, // Mock data - API doesn't provide this yet
    };

    return {
      agent: agentResult.data,
      trades:
        tradesResult.success && tradesResult.data ? tradesResult.data : [],
      portfolio: portfolioData,
    };
  },
  ['agent-portfolio-page-data'],
  {
    revalidate: 5,
    tags: ['agent-data'],
  },
);

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

  // Check if a simplified view is requested
  const minimalView =
    resolvedSearchParams && resolvedSearchParams.minimal === 'true';

  return (
    <div className="container mx-auto px-4 md:mt-6 pb-16">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <Image
                src="/logo.svg"
                alt="Loading..."
                fill
                className="animate-pulse"
              />
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6">
          <AgentPortfolio
            agent={agent}
            trades={trades}
            portfolio={portfolio}
            useSimplifiedView={minimalView}
          />
        </div>
      </Suspense>
    </div>
  );
}
