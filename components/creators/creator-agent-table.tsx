'use client';

import { Agent } from '@/lib/types';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';
import { cn, isPnLPositive, formatPnL } from '@/lib/utils';
import Image from 'next/image';

interface CreatorAgentTableProps {
  agents: Agent[];
}

export function CreatorAgentTable({ agents }: CreatorAgentTableProps) {
  // Format currency values
  const formatCurrency = (value: number | undefined | null) => {
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
            <TableHead className="text-right text-xs py-2">PnL (Cycle)</TableHead>
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
            
            return (
              <TableRow key={agent.id} className="group hover:bg-white/10 transition-all duration-200 cursor-pointer">
                <TableCell className="py-2">
                  <Link href={`/agent/${agent.id}`} className="flex items-center gap-2">
                    <div className="w-7 h-7 relative rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                      {agent.profilePictureUrl ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${agent.profilePictureUrl}`}
                          alt={agent.name}
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                          onError={(e) => {
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
                      <div className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                        #{agent.id.substring(0, 8)}...
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="py-2">
                  <span className={cn('text-lg', isLeftCurve ? 'text-orange-500' : 'text-purple-500')}>
                    {isLeftCurve ? '🦧' : '🐙'}
                  </span>
                </TableCell>
                <TableCell className="text-right py-2">
                  {formatPercentageWithColor(agent.pnlCycle || 0)}
                </TableCell>
                <TableCell className="text-right py-2">
                  {formatPercentageWithColor(agent.pnl24h || 0)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs py-2">
                  {formatNumber(agent.tradeCount || 0)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs py-2">
                  {formatCurrency(agent.tvl || 0)}
                </TableCell>
                <TableCell className="py-2">
                  <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', {
                    'bg-green-500/10 text-green-500': agent.status === 'live' && !isBonding,
                    'bg-yellow-500/10 text-yellow-500': isBonding,
                    'bg-gray-500/10 text-gray-500': agent.status === 'ended',
                  })}>
                    {isBonding
                      ? '🔥 bonding'
                      : agent.status === 'ended'
                      ? '💀 ended'
                      : '🚀 live'}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 