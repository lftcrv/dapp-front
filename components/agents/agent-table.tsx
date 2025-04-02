'use client';

import { memo } from 'react';
import { Agent } from '@/lib/types';
import { cn, isInBondingPhase } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, Search, Users, UserCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { PriceChange } from '@/components/price-change';
import { useAgentsData } from '@/hooks/use-agents-data';
import Image from 'next/image';

interface TableHeaderProps {
  label: string;
  sortKey: keyof Agent;
  currentSort?: { key: keyof Agent; direction: 'asc' | 'desc' };
  onSort?: (key: keyof Agent) => void;
}

const TableHeaderCell = memo(
  ({ label, sortKey, currentSort, onSort }: TableHeaderProps) => {
    const isActive = currentSort && currentSort.key === sortKey;

    return (
      <Button
        variant="ghost"
        onClick={() => onSort?.(sortKey)}
        className={cn(
          'text-xs font-semibold hover:text-primary p-0',
          isActive && 'text-primary',
        )}
      >
        {label} <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    );
  },
);
TableHeaderCell.displayName = 'TableHeaderCell';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = memo(({ value, onChange }: SearchBarProps) => (
  <div className="relative w-full sm:w-64">
    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
    <Input
      placeholder="Search by name/symbol/id..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-8 text-xs bg-white/5"
    />
  </div>
));
SearchBar.displayName = 'SearchBar';

interface AgentRowProps {
  agent: Agent;
  index: number;
}

const AgentRow = memo(({ agent, index }: AgentRowProps) => {
  const { data } = useAgentsData();
  const agentMarketData = data?.marketData[agent.id];
  const isBonding = agentMarketData?.bondingStatus === 'BONDING' || isInBondingPhase(agent.price, agent.holders);
  const isLeftCurve = agent.type === 'leftcurve';

  // Helper function to format currency values
  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Helper function to format percentages
  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    const formattedValue = (value * 100).toFixed(2);
    const isPositive = value > 0;
    return (
      <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
        {isPositive ? '+' : ''}{formattedValue}%
      </span>
    );
  };

  // Helper function to safely format numbers (like trade count)
  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toLocaleString();
  };

  return (
    <TableRow className="group hover:bg-white/10 transition-all duration-200 ease-in-out hover:scale-[1.01] cursor-pointer relative z-10">
      <TableCell className="font-mono text-xs py-2">{index + 1}</TableCell>
      <TableCell className="py-2">
        <Link
          href={`/agent/${agent.id}`}
          className="flex items-center gap-2 hover:opacity-80"
        >
          <div className="w-7 h-7 relative rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
            {agent.profilePictureUrl ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${agent.profilePictureUrl}`}
                alt={agent.name}
                width={28}
                height={28}
                className="w-full h-full object-cover [image-rendering:crisp-edges]"
                onError={(e) => {
                  console.error('❌ Image Load Error:', {
                    src: e.currentTarget.src,
                    name: agent.name,
                  });
                  e.currentTarget.style.display = 'none';
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
            <div className="text-xs text-muted-foreground font-mono">
              #{agent.id}
            </div>
          </div>
        </Link>
      </TableCell>
      <TableCell className="py-2">
        <span
          className={cn(
            'text-lg',
            isLeftCurve ? 'text-orange-500' : 'text-purple-500',
          )}
        >
          {isLeftCurve ? '🦧' : '🐙'}
        </span>
      </TableCell>
      <TableCell className="text-right font-mono text-xs py-2">
        <span className="font-medium">#{formatNumber(agent.cycleRanking || 0)}</span>
      </TableCell>
      <TableCell className="text-right py-2">
        {formatPercentage(agent.pnl24h || agentMarketData?.priceChange24h || 0)}
      </TableCell>
      <TableCell className="text-right font-mono text-xs py-2">
        {formatPercentage(agent.pnlCycle || 0)}
      </TableCell>
      <TableCell className="text-right font-mono text-xs py-2">
        {formatNumber(agent.tradeCount || 0)}
      </TableCell>
      <TableCell className="text-right font-mono text-xs py-2">
        {formatCurrency(agent.tvl || 0)}
      </TableCell>
      <TableCell className="text-right font-mono text-[10px] py-2">
        <div
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5',
            'bg-blue-500/20 text-black font-medium',
            'justify-between w-16',
          )}
        >
          <Users className="w-2.5 h-2.5" />
          {formatNumber(agent.forkerCount || 0)}
        </div>
      </TableCell>
      <TableCell className="py-2">
        <span
          className={cn(
            'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
            {
              'bg-green-500/10 text-green-500':
                !isBonding && agent.status !== 'ended',
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
      </TableCell>
    </TableRow>
  );
});
AgentRow.displayName = 'AgentRow';

const LoadingState = memo(() => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center space-x-4 p-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    ))}
  </div>
));
LoadingState.displayName = 'LoadingState';

interface AgentTableProps {
  agents: Agent[];
  isLoading?: boolean;
  error?: Error | null;
  sortConfig?: { key: keyof Agent; direction: 'asc' | 'desc' };
  onSort?: (key: keyof Agent) => void;
}

export function AgentTable({
  agents,
  isLoading = false,
  error = null,
  sortConfig, // Make it optional without default
  onSort, // Make it optional without default
}: AgentTableProps) {
  // Disable sorting if no config provided
  const showSortControls = Boolean(sortConfig && onSort);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message || 'Failed to load agents'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative overflow-x-auto overflow-y-hidden">
      <Table className="overflow-hidden bg-[#F6ECE7] rounded-lg">
        <TableHeader>
          <TableRow className="hover:bg-white/10">
            <TableHead className="w-[50px] text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="#"
                  sortKey="id"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                '#'
              )}
            </TableHead>
            <TableHead className="text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="Agent"
                  sortKey="name"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                'Agent'
              )}
            </TableHead>
            <TableHead className="text-xs py-2">Type</TableHead>
            <TableHead className="text-right text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="Cycle Ranking"
                  sortKey="cycleRanking"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                'Cycle Ranking'
              )}
            </TableHead>
            <TableHead className="text-right text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="PnL (24h)"
                  sortKey="pnl24h"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                'PnL (24h)'
              )}
            </TableHead>
            <TableHead className="text-right text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="PnL (Cycle)"
                  sortKey="pnlCycle"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                'PnL (Cycle)'
              )}
            </TableHead>
            <TableHead className="text-right text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="#Trades"
                  sortKey="tradeCount"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                '#Trades'
              )}
            </TableHead>
            <TableHead className="text-right text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="TVL"
                  sortKey="tvl"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                'TVL'
              )}
            </TableHead>
            <TableHead className="text-right text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="#Forkers"
                  sortKey="forkerCount"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                '#Forkers'
              )}
            </TableHead>
            <TableHead className="text-right text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="Status"
                  sortKey="status"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                'Status'
              )}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent, index) => (
            <AgentRow key={agent.id} agent={agent} index={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
