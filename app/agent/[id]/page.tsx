import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { getCompleteAgentData } from '@/actions/agents/token/getTokenInfo';
import { tradeService } from '@/lib/services/api/trades';
import { AgentPortfolio } from '@/components/agent/agent-portfolio';
import Image from 'next/image';

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

    // Mock portfolio data (in real implementation this would come from an API)
    const portfolioData = {
      totalValue: 42689.75,
      change24h: 8.25, // Percentage
      changeValue24h: 3248.92, // Absolute value
      allocation: [
        { asset: 'ETH', value: 18450.25, percentage: 43.2, color: '#627EEA' },
        { asset: 'USDC', value: 12500.0, percentage: 29.3, color: '#2775CA' },
        { asset: 'WBTC', value: 8950.5, percentage: 21.0, color: '#F7931A' },
        { asset: 'STRK', value: 2789.0, percentage: 6.5, color: '#FF4C8B' },
      ],
      historicalData: Array.from({ length: 30 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));

        // Generate semi-realistic looking chart data with some volatility
        const baseValue = 35000;
        const trend = Math.sin(i / 5) * 3000; // General trend
        const noise = (Math.random() - 0.5) * 2000; // Random noise

        return {
          date: date.toISOString().split('T')[0],
          value: baseValue + trend + noise + i * 300, // Slightly upward trend
        };
      }),
      pnlData: {
        total: 12450.25,
        percentage: 41.2,
        monthly: Array.from({ length: 30 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));

          const isProfitable = Math.random() > 0.3; // 70% chance of profit
          const value = Math.random() * 500 * (isProfitable ? 1 : -1);

          return {
            date: date.toISOString().split('T')[0],
            value,
          };
        }),
      },
      ranking: {
        global: 17,
        category: 5,
        change: 3, // Moved up 3 places
      },
      totalTrades: 237,
      forkingRevenue: 1258.42,
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

interface PageProps {
  params: { id: string };
  searchParams?: { simplified?: string };
}

export default async function AgentPortfolioPage({ params, searchParams }: PageProps) {
  if (!params.id) {
    notFound();
  }

  const { agent, trades, portfolio, error } = await getCachedPageData(
    params.id,
  );

  if (error || !agent) {
    notFound();
  }

  // Check if simplified view is requested via URL param
  const useSimplifiedView = searchParams?.simplified === 'true';

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
