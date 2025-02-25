'use client';
import { Suspense, lazy, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AgentHeader } from '@/components/agent-header';
import { AgentThemeProvider } from '@/lib/agent-theme-context';
import { BondingCurveProvider } from '@/lib/bonding-curve-context';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Loading } from '@/components/ui/loading';
import { Agent, Trade } from '@/lib/types';

// Lazy load components that are not immediately visible
const BondingCurveChart = lazy(() =>
  import('@/components/bonding-curve-chart').then((mod) => ({
    default: mod.BondingCurveChart,
  })),
);
const SwapWidget = lazy(() =>
  import('@/components/swap-widget').then((mod) => ({
    default: mod.SwapWidget,
  })),
);
const AgentStatsCard = lazy(() =>
  import('@/components/agent-stats-card').then((mod) => ({
    default: mod.AgentStatsCard,
  })),
);
const PriceActionCard = lazy(() =>
  import('@/components/agent/price-action-card').then((mod) => ({
    default: mod.PriceActionCard,
  })),
);
const TradeHistoryCard = lazy(() =>
  import('@/components/agent/trade-history-card').then((mod) => ({
    default: mod.TradeHistoryCard,
  })),
);
const ChatCard = lazy(() =>
  import('@/components/agent/chat-card').then((mod) => ({
    default: mod.ChatCard,
  })),
);

interface AgentContentProps {
  agent: Agent;
  initialTrades?: Trade[];
}

export function AgentContent({ agent, initialTrades = [] }: AgentContentProps) {
  // Add refs to components that need refreshing
  const priceActionRef = useRef<{ refetch?: () => void }>({});
  const bondingCurveRef = useRef<{ refetch?: () => void }>({});
  const agentStatsRef = useRef<{ refetch?: () => void }>({});

  // Callback to refresh all components after a transaction
  const handleTransactionSuccess = useCallback(() => {
    // Refresh individual components that need real-time updates
    priceActionRef.current?.refetch?.();
    bondingCurveRef.current?.refetch?.();
    agentStatsRef.current?.refetch?.();
  }, []);

  return (
    <AgentThemeProvider agentId={agent.id}>
      <BondingCurveProvider agentId={agent.id}>
        <AgentHeader agent={agent}>
          <Suspense fallback={<Loading variant={agent.type} />}>
            <ChatCard agent={agent} />
          </Suspense>
        </AgentHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnimatedSection
            className="lg:col-span-2 space-y-6"
            direction="left"
            delay={0.3}
          >
            <Suspense fallback={<Loading variant={agent.type} />}>
              <PriceActionCard ref={priceActionRef} agent={agent} />
            </Suspense>
            <Suspense fallback={<Loading variant={agent.type} />}>
              <TradeHistoryCard agentId={agent.id} initialTrades={initialTrades} />
            </Suspense>
            {/* Le ChatCard est maintenant dans le header, donc on le supprime d'ici */}
          </AnimatedSection>

          <AnimatedSection className="space-y-6" direction="right" delay={0.4}>
            <Suspense fallback={<Loading variant={agent.type} />}>
              <Card className={cn('border-2')}>
                <SwapWidget 
                  agent={agent} 
                  onTransactionSuccess={handleTransactionSuccess}
                />
              </Card>
            </Suspense>
            <Suspense fallback={<Loading variant={agent.type} />}>
              <BondingCurveChart ref={bondingCurveRef} agent={agent} />
            </Suspense>
            <Suspense fallback={<Loading variant={agent.type} />}>
              <AgentStatsCard ref={agentStatsRef} agent={agent} />
            </Suspense>
          </AnimatedSection>
        </div>
      </BondingCurveProvider>
    </AgentThemeProvider>
  );
}