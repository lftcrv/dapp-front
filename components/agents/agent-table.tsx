'use client';

import { Agent } from '@/lib/types';
import { cn, isInBondingPhase } from '@/lib/utils';
import { AgentAvatar } from '@/components/ui/agent-avatar';
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
import { ArrowUpDown, Search, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { PriceChange } from '@/components/price-change';
import { memo } from 'react';
import { useTokenMarketData } from '@/hooks/use-token-market-data';

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
  const { data: marketData } = useTokenMarketData(agent.id);
  const isBonding = marketData?.bondingStatus === 'BONDING' || isInBondingPhase(agent.price, agent.holders);
  const isLeftCurve = agent.type === 'leftcurve';

  // Helper function to safely format ETH values from Wei with bold non-zero digits
  const formatEthValue = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '0';
    
    // Convert to number and then to ETH (1 ETH = 10^18 Wei)
    const weiValue = typeof value === 'string' ? parseFloat(value) : value;
    const ethValue = weiValue / 1e18;
    
    // Format with exactly 14 decimal places
    const rawValue = ethValue.toLocaleString('en-US', {
      minimumFractionDigits: 14,
      maximumFractionDigits: 14,
      useGrouping: true, // This ensures we get commas for thousands
    });

    // Split the string into characters and wrap non-zero digits in strong tags
    return rawValue.split('').map((char, i) => {
      if (char >= '1' && char <= '9') {
        return `<strong>${char}</strong>`;
      }
      return char;
    }).join('');
  };

  // Helper function to safely format regular numbers (like holders count)
  const formatNumber = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString();
  };

  return (
    <TableRow className="group hover:bg-white/5">
      <TableCell className="font-mono text-xs py-2">{index + 1}</TableCell>
      <TableCell className="py-2">
        <Link
          href={`/agent/${agent.id}`}
          className="flex items-center gap-2 hover:opacity-80"
        >
          <div className="w-7 h-7 relative rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
            <AgentAvatar src={agent.avatar} alt={agent.name} />
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
        <span className="font-medium">Ξ</span>
        <span 
          className="tabular-nums" 
          dangerouslySetInnerHTML={{ __html: formatEthValue(marketData?.price || agent.price) }}
        />
      </TableCell>
      <TableCell className="text-right py-2">
        {marketData?.priceChange24h !== undefined && marketData?.priceChange24h !== null ? (
          <PriceChange initialValue={marketData.priceChange24h} />
        ) : (
          <span className="text-xs text-muted-foreground font-mono">N/A</span>
        )}
      </TableCell>
      <TableCell className="text-right font-mono text-xs py-2">
        <span className="font-medium">Ξ</span>
        <span 
          className="tabular-nums"
          dangerouslySetInnerHTML={{ __html: formatEthValue(marketData?.marketCap || agent.marketCap) }}
        />
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
          {(marketData?.holders || agent.holders) > 0 ? 
            formatNumber(marketData?.holders || agent.holders) : 
            'N/A'
          }
        </div>
      </TableCell>
      <TableCell className="text-right py-2">
        <div className="flex flex-col items-end">
          <div
            className={cn(
              'font-mono text-xs',
              isLeftCurve ? 'text-orange-500' : 'text-purple-500',
            )}
          >
            {isLeftCurve
              ? `DEGEN ${(agent.creativityIndex * 100).toFixed(0)}%`
              : `WIN ${(agent.performanceIndex * 100).toFixed(0)}%`}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {isLeftCurve
              ? `win ${(agent.performanceIndex * 100).toFixed(0)}%`
              : `degen ${(agent.creativityIndex * 100).toFixed(0)}%`}
          </div>
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
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-white/5">
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
                  label="Price"
                  sortKey="price"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                'Price'
              )}
            </TableHead>
            <TableHead className="text-right text-xs py-2">24h</TableHead>
            <TableHead className="text-right text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="Market Cap"
                  sortKey="marketCap"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                'Market Cap'
              )}
            </TableHead>
            <TableHead className="text-right text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="Holders"
                  sortKey="holders"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                'Holders'
              )}
            </TableHead>
            <TableHead className="text-right text-xs py-2">
              {showSortControls ? (
                <TableHeaderCell
                  label="Score"
                  sortKey="performanceIndex"
                  currentSort={sortConfig}
                  onSort={onSort}
                />
              ) : (
                'Score'
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
