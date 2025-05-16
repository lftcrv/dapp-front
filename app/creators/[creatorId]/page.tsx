'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  BarChart,
  RotateCcw,
  UserCircle,
  DollarSign,
} from 'lucide-react';
import Background from '@/components/ui/background';
import { getCreatorPerformance } from '@/actions/creators/getCreatorPerformance';
import { Agent } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, isPnLPositive, formatPnL } from '@/lib/utils';

// Simplified Creator Detail Type - for the header primarily
interface CreatorDisplayInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  joinedDate: string; // from performanceData.creatorCardData.createdAt (api.lastUpdated)
  // Add other specific fields for header if needed, e.g., totalBalanceInUSD from raw API
}

// Type for the stats needed by CreatorStatCards
// This aligns with what getCreatorPerformance.creatorStats provides
interface PageStats {
  totalAgents: number;
  runningAgents: number;
  totalPnl: number;
  totalTrades: number;
  bestAgent: Agent | null;
  totalPortfolioBalance: number;
}

// Updated formatCurrency to allow specifying decimal places
function formatCurrency(
  amount: number,
  compact = false,
  maximumFractionDigits = 2,
) {
  if (compact && Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      signDisplay: 'always',
      minimumFractionDigits: 1, // For compact view, 1 decimal is fine
      maximumFractionDigits: 1,
    })}k`;
  }

  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'always',
    minimumFractionDigits: maximumFractionDigits, // Use passed arg
    maximumFractionDigits: maximumFractionDigits, // Use passed arg
  });
}

// Modify CreatorStatCards for 5 columns and no decimals for Total Agent Balances
function CreatorStatCards({ stats }: { stats: PageStats }) {
  return (
    // Adjusted grid to allow for 5 columns on large screens
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
          {stats.runningAgents} Active Agent
          {stats.runningAgents !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Total Portfolio Balance Card - use formatCurrency with 0 decimal places */}
      <div className="bg-white/30 rounded-lg p-4 shadow-sm border border-gray-200/30">
        <div className="flex items-center mb-2">
          <div className="p-2 rounded-full bg-indigo-100 mr-3">
            <DollarSign className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="font-medium">Total Agent Balances</h3>
        </div>
        <p className="text-2xl font-semibold">
          {formatCurrency(stats.totalPortfolioBalance, false, 0)}
        </p>{' '}
        {/* No decimals */}
        <p className="text-sm text-muted-foreground">
          Sum of all agent balances
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
        <p className="text-2xl font-semibold">
          {stats.totalTrades.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">Across all agents</p>
      </div>

      {/* Total PnL Card */}
      <div className="bg-white/30 rounded-lg p-4 shadow-sm border border-gray-200/30">
        <div className="flex items-center mb-2">
          <div className="p-2 rounded-full bg-green-100 mr-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-medium">Total PnL</h3>
        </div>
        <p
          className={`text-2xl font-semibold ${
            stats.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatCurrency(stats.totalPnl, true)}
        </p>{' '}
        {/* Compact view implies some decimals for k */}
        <p className="text-sm text-muted-foreground">Overall performance</p>
      </div>

      {/* Best Agent Card */}
      {stats.bestAgent && (
        <div className="bg-white/30 rounded-lg p-4 shadow-sm border border-gray-200/30">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-full bg-orange-100 mr-3">
              <BarChart className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-medium">Best Agent</h3>
          </div>
          <p
            className="text-xl font-semibold truncate"
            title={stats.bestAgent.name}
          >
            {stats.bestAgent.name}
          </p>
          <p className="text-sm text-muted-foreground">
            PnL: {formatCurrency(stats.bestAgent.pnlCycle || 0)}{' '}
            {/* Default decimals for PnL */}
          </p>
        </div>
      )}
      {/* If no best agent, and you want to maintain grid structure, add a placeholder or an empty div */}
      {!stats.bestAgent && <div className="hidden lg:block"></div>}
    </div>
  );
}

// Agent Table Component - receives Agent[] which is already mapped by getCreatorPerformance
function CreatorAgentTable({ agents }: { agents: Agent[] }) {
  // Format currency values
  const formatCurrencyTable = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Format PnL values with color
  const formatPercentageWithColor = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    const isPositive = isPnLPositive(value);

    return (
      <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
        {formatPnL(value, true)}
      </span>
    );
  };

  // Safely format numbers
  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toLocaleString();
  };

  return (
    <div className="relative overflow-x-auto overflow-y-hidden">
      <Table className="overflow-hidden bg-white/10 rounded-lg">
        <TableHeader>
          <TableRow className="hover:bg-white/10">
            <TableHead className="w-[250px] text-xs py-2">Agent</TableHead>
            <TableHead className="text-xs py-2">Type</TableHead>
            <TableHead className="text-right text-xs py-2">
              PnL (Cycle)
            </TableHead>
            <TableHead className="text-right text-xs py-2">PnL (24h)</TableHead>
            <TableHead className="text-right text-xs py-2"># Trades</TableHead>
            <TableHead className="text-right text-xs py-2">Balance</TableHead>
            <TableHead className="text-right text-xs py-2">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => {
            const isLeftCurve = agent.type === 'leftcurve';
            const isBonding = agent.status === 'bonding';

            // Construct cells as an array to be very explicit about children of TableRow
            const tableCells = [
              <TableCell key={`agent-info-${agent.id}`} className="py-2">
                <Link
                  href={`/agent/${agent.id}`}
                  className="flex items-center gap-2"
                >
                  <div className="w-7 h-7 relative rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                    {agent.profilePictureUrl ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${agent.profilePictureUrl}`}
                        alt={agent.name}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            'none';
                        }}
                      />
                    ) : (
                      <UserCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {agent.name}
                      <span className="text-xs text-muted-foreground font-mono">
                        ${agent.symbol}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                      #{agent.id.substring(0, 8)}...
                    </div>
                  </div>
                </Link>
              </TableCell>,
              <TableCell key={`type-${agent.id}`} className="py-2">
                <span
                  className={cn(
                    'text-lg',
                    isLeftCurve ? 'text-orange-500' : 'text-purple-500',
                  )}
                >
                  {isLeftCurve ? '🦧' : '🐙'}
                </span>
              </TableCell>,
              <TableCell
                key={`pnl-cycle-${agent.id}`}
                className="text-right py-2"
              >
                {formatPercentageWithColor(agent.pnlCycle || 0)}
              </TableCell>,
              <TableCell
                key={`pnl-24h-${agent.id}`}
                className="text-right py-2"
              >
                {formatPercentageWithColor(agent.pnl24h || 0)}
              </TableCell>,
              <TableCell
                key={`trades-${agent.id}`}
                className="text-right font-mono text-xs py-2"
              >
                {formatNumber(agent.tradeCount || 0)}
              </TableCell>,
              <TableCell
                key={`balance-${agent.id}`}
                className="text-right font-mono text-xs py-2"
              >
                {formatCurrencyTable(agent.tvl || 0)}
              </TableCell>,
              <TableCell key={`status-${agent.id}`} className="py-2">
                <span
                  className={cn(
                    'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                    {
                      'bg-green-500/10 text-green-500':
                        agent.status === 'live' && !isBonding,
                      'bg-yellow-500/10 text-yellow-500': isBonding,
                      'bg-gray-500/10 text-gray-500': agent.status === 'ended',
                    },
                  )}
                >
                  {isBonding
                    ? '🔥 bonding'
                    : agent.status === 'ended'
                    ? '💀 ended'
                    : '🚀 live'}
                </span>
              </TableCell>,
            ];

            return (
              <TableRow
                key={agent.id}
                className="group hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                {tableCells}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Client Component that does the actual rendering
function CreatorDetailClientPage({ creatorId }: { creatorId: string }) {
  const [creatorInfo, setCreatorInfo] = useState<CreatorDisplayInfo | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [pageStats, setPageStats] = useState<PageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching creator performance data for:', creatorId);
        const result = await getCreatorPerformance(creatorId);
        console.log('Performance API response (client):', result);

        if (result.success && result.data) {
          const perfData = result.data;
          
          setCreatorInfo({
            id: creatorId,
            name: `${creatorId.substring(0, 8)}...`, 
            joinedDate: perfData.creatorCardData.createdAt, 
          });

          setAgents(perfData.agents);
          
          setPageStats(perfData.creatorStats);

        } else {
          console.error('Failed to fetch creator performance data:', result.error);
          setError(result.error || 'Failed to load performance data');
        }
      } catch (err) {
        console.error('Error in performance data loading (client):', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }

    if (creatorId) loadData();
  }, [creatorId]);

  // NOTE: The useEffect that was causing infinite loop by updating creator.totalPnl is removed.
  // totalPnl for the header should come from pageStats.totalPnl if needed, or a dedicated field in CreatorDisplayInfo

  return (
    <main className="flex min-h-screen flex-col bg-[#F6ECE7]">
      <Background />
      <div className="container max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <Link href="/creators" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Creators
        </Link>

        {isLoading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md text-center mb-6">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && creatorInfo && pageStats && (
          <>
            <div className="bg-[#F0E6E1] rounded-xl p-6 shadow-sm mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={creatorInfo.avatarUrl} alt={`${creatorInfo.name}'s avatar`} />
                  <AvatarFallback className="bg-white/20 text-foreground font-bold">{creatorInfo.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-sketch mb-1">{creatorInfo.name}</h1>
                  <p className="text-muted-foreground text-sm">Joined: {new Date(creatorInfo.joinedDate).toLocaleDateString()}</p>
                  <p className="text-muted-foreground text-sm">Overall PnL (from stats): {formatCurrency(pageStats.totalPnl, true)}</p>
                </div>
              </div>
              <CreatorStatCards stats={pageStats} />
            </div>
            
            <div className="bg-[#F0E6E1] rounded-xl p-6 shadow-sm">
              <h2 className="font-sketch text-2xl mb-6">Agents by {creatorInfo.name}</h2>
              {agents.length > 0 ? (
                <CreatorAgentTable agents={agents} />
              ) : (
                <div className="text-center py-10 text-muted-foreground">This creator hasn&apos;t created any agents yet.</div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function Page(props: { 
  // Type params as a Promise to align with Next.js build expectations for page components
  params: Promise<{ creatorId: string }>; 
}) {
  // React.use will unwrap the promise (or pass through if already resolved in some client contexts)
  const resolvedParams = use(props.params); 
  // It's good practice to assert the type if 'use' might return unknown or a broader type
  const creatorId = (resolvedParams as { creatorId: string }).creatorId;

  return <CreatorDetailClientPage creatorId={creatorId} />;
}
