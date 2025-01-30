'use client'

import { Suspense, lazy } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { AgentHeader } from '@/components/agent-header'
import { AgentThemeProvider } from '@/lib/agent-theme-context'
import { AnimatedSection } from '@/components/ui/animated-section'
import { Loading } from "@/components/ui/loading"
import { Agent } from '@/lib/types'

// Lazy load components that are not immediately visible
const BondingCurveChart = lazy(() => import('@/components/bonding-curve-chart').then(mod => ({ default: mod.BondingCurveChart })))
const SwapWidget = lazy(() => import('@/components/swap-widget').then(mod => ({ default: mod.SwapWidget })))
const AgentStatsCard = lazy(() => import('@/components/agent-stats-card').then(mod => ({ default: mod.AgentStatsCard })))
const PriceActionCard = lazy(() => import('@/components/agent/price-action-card').then(mod => ({ default: mod.PriceActionCard })))
const TradeHistoryCard = lazy(() => import('@/components/agent/trade-history-card').then(mod => ({ default: mod.TradeHistoryCard })))
const ChatCard = lazy(() => import('@/components/agent/chat-card').then(mod => ({ default: mod.ChatCard })))

interface AgentContentProps {
  agent: Agent
}

export function AgentContent({ agent }: AgentContentProps) {
  return (
    <AgentThemeProvider agentId={agent.id}>
      <AgentHeader agent={agent} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatedSection className="lg:col-span-2 space-y-6" direction="left" delay={0.3}>
          <Suspense fallback={<Loading variant={agent.type} />}>
            <PriceActionCard agent={agent} />
          </Suspense>
          
          <Suspense fallback={<Loading variant={agent.type} />}>
            <TradeHistoryCard agentId={agent.id} />
          </Suspense>
          
          <Suspense fallback={<Loading variant={agent.type} />}>
            <ChatCard agent={agent} />
          </Suspense>
        </AnimatedSection>

        <AnimatedSection className="space-y-6" direction="right" delay={0.4}>
          <Suspense fallback={<Loading variant={agent.type} />}>
            <Card className={cn("border-2")}>
              <SwapWidget agent={agent} />
            </Card>
          </Suspense>
          
          <Suspense fallback={<Loading variant={agent.type} />}>
            <BondingCurveChart agent={agent} />
          </Suspense>
          
          <Suspense fallback={<Loading variant={agent.type} />}>
            <AgentStatsCard agent={agent} />
          </Suspense>
        </AnimatedSection>
      </div>
    </AgentThemeProvider>
  )
} 