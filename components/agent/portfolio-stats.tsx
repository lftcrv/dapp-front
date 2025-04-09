'use client';

import { memo } from 'react';

import { Trophy, BarChart3, GitFork } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentType } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface PortfolioStatsProps {
  cycleRanking?: number;
  totalTrades: number;
  forkingRevenue: number;
  agentType: AgentType;
}

const PortfolioStats = memo(
  ({ cycleRanking, totalTrades, forkingRevenue }: PortfolioStatsProps) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Ranking Card */}
        <div className="bg-white/80 rounded-xl p-4 flex items-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div
            className={cn(
              'p-3 rounded-lg mr-4',
              cycleRanking === 1
                ? 'bg-yellow-500/20'
                : cycleRanking && cycleRanking <= 3
                ? 'bg-yellow-400/20'
                : cycleRanking && cycleRanking <= 10
                ? 'bg-orange-400/20'
                : 'bg-yellow-500/10',
            )}
          >
            <Trophy
              className={cn(
                'h-6 w-6',
                cycleRanking === 1
                  ? 'text-yellow-600'
                  : cycleRanking && cycleRanking <= 3
                  ? 'text-yellow-500'
                  : cycleRanking && cycleRanking <= 10
                  ? 'text-orange-500'
                  : 'text-yellow-600',
              )}
            />
          </div>
          <div>
            <h3 className="text-sm text-gray-600 font-sketch">
              Performance Ranking
            </h3>
            <div className="flex items-baseline">
              <span
                className={cn(
                  'text-2xl font-bold font-patrick',
                  cycleRanking === 1
                    ? 'text-yellow-600'
                    : cycleRanking && cycleRanking <= 3
                    ? 'text-yellow-500'
                    : cycleRanking && cycleRanking <= 10
                    ? 'text-orange-500'
                    : 'text-gray-900',
                )}
              >
                {cycleRanking !== undefined ? (
                  <>
                    {cycleRanking}
                    {cycleRanking === 1
                      ? 'st'
                      : cycleRanking === 2
                      ? 'nd'
                      : cycleRanking === 3
                      ? 'rd'
                      : 'th'}
                  </>
                ) : (
                  'N/A'
                )}
              </span>
              <span className="text-xs text-gray-500 font-patrick ml-1">
                of all agents
              </span>
            </div>
            <div className="text-xs font-patrick text-gray-800 mt-0.5">
              <span className="text-gray-500">
                Ranked by profit in current cycle
              </span>
            </div>
          </div>
        </div>

        {/* Total Trades Card */}
        <div className="bg-white/80 rounded-xl p-4 flex items-center border border-gray-200 shadow-sm">
          <div className="p-3 rounded-lg bg-blue-500/10 mr-4">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm text-gray-600 font-sketch">Total Trades</h3>
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
              <span className="font-patrick blur-sm">See 17 forkers</span>
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

PortfolioStats.displayName = 'PortfolioStats';

export default PortfolioStats;
