'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, BarChart3, GitFork, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentType } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface PortfolioStatsProps {
  ranking: {
    global: number;
    category: number;
    change: number;
  };
  totalTrades: number;
  forkingRevenue: number;
  agentType: AgentType;
}

const PortfolioStats = memo(
  ({
    ranking,
    totalTrades,
    forkingRevenue,
    agentType,
  }: PortfolioStatsProps) => {
    const isLeftCurve = agentType === 'leftcurve';

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Ranking Card */}
        <div className="bg-white/80 rounded-xl p-4 flex items-center border border-gray-200 shadow-sm">
          <div className="p-3 rounded-lg bg-yellow-500/10 mr-4">
            <Trophy className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-sm text-gray-600 font-sketch">
              Cycle&apos;s Ranking
            </h3>
            <div>
              <span className="text-2xl font-bold font-patrick text-gray-900">
                {ranking.global}
              </span>
              <span className="text-xs text-gray-500 font-patrick">
                {' '}
                Global
              </span>
            </div>
            <div className="text-xs font-patrick text-gray-800">
              <span>{ranking.category}</span>
              <span className="text-gray-500">
                {' '}
                in {agentType === 'leftcurve' ? 'DEGEN Agents' : 'SIGMA Agents'}
              </span>
            </div>
            {ranking.change !== 0 && (
              <div
                className={cn(
                  'text-xs flex items-center mt-1',
                  ranking.change > 0 ? 'text-green-600' : 'text-red-600',
                )}
              >
                {ranking.change > 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                <span className="font-patrick">
                  {Math.abs(ranking.change)}{' '}
                  {ranking.change > 0 ? 'up' : 'down'} from last week
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Total Trades Card */}
        <div className="bg-white/80 rounded-xl p-4 flex items-center border border-gray-200 shadow-sm">
          <div className="p-3 rounded-lg bg-blue-500/10 mr-4">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm text-gray-600 font-sketch">
              Total Trades
            </h3>
            <div className="text-2xl font-bold font-patrick text-gray-900">
              {totalTrades.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Forking Revenue Card */}
        <div className="bg-white/80 col-span-2 rounded-xl p-4 flex items-center border border-gray-200 shadow-sm">
          <div className="p-3 rounded-lg bg-green-500/10 mr-4">
            <GitFork className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm text-gray-600 font-sketch">
              Forking Revenue
            </h3>
            <div className="flex items-end ">
              <span className="text-2xl font-bold font-patrick text-gray-900 blur-sm">
                Ξ
                {forkingRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-sm bg-white hover:bg-gray-100 text-gray-800 border-gray-200"
            >
              <GitFork className="h-3.5 w-3.5" />
              <span className="font-patrick">See 17 forkers</span>
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

PortfolioStats.displayName = 'PortfolioStats';

export default PortfolioStats;
