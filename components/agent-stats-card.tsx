'use client';

import { Card } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Agent } from '@/lib/types';
import { memo, useMemo, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { useBondingCurve } from '@/lib/bonding-curve-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAgentStats } from '@/lib/use-agent-stats';

interface StatItemProps {
  label: string;
  value: string | number;
  color: string;
  icon?: string;
  delay?: number;
}

const StatItem = memo(
  ({ label, value, color, icon, delay = 0 }: StatItemProps) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn('flex justify-between items-center p-2 rounded-lg', color)}
    >
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold">{value}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
    </motion.div>
  ),
);
StatItem.displayName = 'StatItem';

interface AgentStatsCardProps {
  agent: Agent;
}

export const AgentStatsCard = forwardRef<{ refetch?: () => void }, { agent: Agent }>(
  ({ agent }, ref) => {
    const { data: stats, isLoading, error, refetch } = useAgentStats(agent.id);

    useImperativeHandle(ref, () => ({
      refetch
    }), [refetch]);

    const isLeftCurve = agent.type === 'leftcurve';
    const { data: bondingCurveData } = useBondingCurve();

    const statsData = useMemo(() => {
      const baseColor = isLeftCurve ? 'bg-yellow-500/5' : 'bg-purple-500/5';

      return [
        {
          label: 'Price',
          value: `Ξ${(Number(bondingCurveData.currentPrice) / 1e18).toFixed(14)}`,
          color: baseColor,
          delay: 0.1,
        },
        {
          label: 'Holders',
          value: agent.holders.toLocaleString(),
          color: baseColor,
          delay: 0.2,
        },
        {
          label: 'Market Cap',
          value: `Ξ${(Number(bondingCurveData.marketCap) / 1e18).toFixed(14)}`,
          color: baseColor,
          delay: 0.3,
        },
        isLeftCurve
          ? {
              label: 'Degen Score',
              value: agent.creativityIndex?.toFixed(2) || '0',
              color: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
              icon: '🦧',
              delay: 0.4,
            }
          : {
              label: 'Win Rate',
              value: `${((agent.performanceIndex || 0) * 100).toFixed(1)}%`,
              color: 'bg-gradient-to-r from-purple-500/20 to-blue-500/20',
              icon: '🐙',
              delay: 0.4,
            },
      ];
    }, [agent, isLeftCurve, bondingCurveData]);

    return (
      <TooltipProvider>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={cn(
              'p-6 border-2 transition-colors duration-200',
              isLeftCurve
                ? 'hover:border-yellow-500/50'
                : 'hover:border-purple-500/50',
            )}
          >
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="font-medium mb-4 flex items-center gap-2"
            >
              <Brain
                className={cn(
                  'h-4 w-4',
                  isLeftCurve ? 'text-yellow-500' : 'text-purple-500',
                )}
              />
              Performance Stats
            </motion.h3>
            <div className="space-y-3 text-sm">
              {statsData.map((stat) => (
                <Tooltip key={stat.label}>
                  <TooltipTrigger asChild>
                    <div>
                      <StatItem {...stat} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {stat.label}: {stat.value}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </Card>
        </motion.div>
      </TooltipProvider>
    );
  }
);
AgentStatsCard.displayName = 'AgentStatsCard';
