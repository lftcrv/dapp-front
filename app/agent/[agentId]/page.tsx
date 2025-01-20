'use client'

import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Suspense, lazy } from 'react'
import { cn } from '@/lib/utils'
import { AgentHeader } from '@/components/agent-header'
import { AgentThemeProvider, useAgentTheme } from '@/lib/agent-theme-context'
import { AnimatedSection } from '@/components/ui/animated-section'
import { useAgent } from '@/hooks/use-agents'
import { Loading } from "@/components/ui/loading"

// Lazy load components that are not immediately visible
const BondingCurveChart = lazy(() => import('@/components/bonding-curve-chart').then(mod => ({ default: mod.BondingCurveChart })))
const SwapWidget = lazy(() => import('@/components/swap-widget').then(mod => ({ default: mod.SwapWidget })))
const AgentStatsCard = lazy(() => import('@/components/agent-stats-card').then(mod => ({ default: mod.AgentStatsCard })))
const PriceActionCard = lazy(() => import('@/components/agent/price-action-card').then(mod => ({ default: mod.PriceActionCard })))
const TradeHistoryCard = lazy(() => import('@/components/agent/trade-history-card').then(mod => ({ default: mod.TradeHistoryCard })))
const ChatCard = lazy(() => import('@/components/agent/chat-card').then(mod => ({ default: mod.ChatCard })))

function AgentNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <span className="text-6xl">😵</span>
          <h1 className="font-sketch text-2xl">Agent Not Found</h1>
          <p className="text-muted-foreground">This agent is lost in the matrix...</p>
        </div>
      </div>
    </main>
  )
}

function AgentContent({ agentId }: { agentId: string }) {
  const { data: agent, isLoading, error } = useAgent({ id: agentId })
  const { cardStyle } = useAgentTheme()
  
  if (isLoading) {
    return <Loading />
  }

  if (error || !agent) {
    return <AgentNotFound />
  }

  return (
    <>
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
            <Card className={cn("border-2", cardStyle)}>
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
    </>
  )
}

export default function AgentPage() {
  const params = useParams()
  const agentId = params.agentId as string
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-7xl mx-auto px-4">
        <AgentThemeProvider agentId={agentId}>
          <AgentContent agentId={agentId} />
        </AgentThemeProvider>
      </div>
    </main>
  )
} 