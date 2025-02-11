import { forwardRef, useImperativeHandle } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { Agent } from '@/lib/types';
import { AgentCard } from '@/components/ui/agent-card';
import { PriceChart } from '@/components/price-chart';
import { isInBondingPhase } from '@/lib/utils';
import { useAgentTheme } from '@/lib/agent-theme-context';
import { usePrices } from '@/hooks/use-prices';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PriceActionCardProps {
  agent: Agent;
}

export const PriceActionCard = forwardRef<{ refetch?: () => void }, PriceActionCardProps>(
  ({ agent }, ref) => {
    const { prices, isLoading, error, refetch } = usePrices({ 
      agentId: agent.id
    });
    const theme = useAgentTheme();

    useImperativeHandle(ref, () => ({
      refetch
    }), [refetch]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <Loading variant={theme.mode as 'leftcurve' | 'rightcurve'} />
        </div>
      );
    }

    if (error) {
      return (
        <AgentCard title="Price Action" icon={TrendingUp} badge={theme.mode}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'Failed to load price data'}
            </AlertDescription>
          </Alert>
        </AgentCard>
      );
    }

    return (
      <AgentCard title="Price Action" icon={TrendingUp} badge={theme.mode}>
        <PriceChart
          data={prices}
          symbol={agent.symbol}
          baseToken={agent.symbol}
          inBondingCurve={isInBondingPhase(agent.price, agent.holders)}
        />
      </AgentCard>
    );
  }
);

PriceActionCard.displayName = 'PriceActionCard';
