'use client'

import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { BondingCurveChart } from '@/components/bonding-curve-chart'
import { SwapWidget } from '@/components/swap-widget'
import { cn } from '@/lib/utils'
import { AgentHeader } from '@/components/agent-header'
import { AgentStatsCard } from '@/components/agent-stats-card'
import { PriceActionCard } from '@/components/agent/price-action-card'
import { TradeHistoryCard } from '@/components/agent/trade-history-card'
import { ChatCard } from '@/components/agent/chat-card'
import { AgentThemeProvider, useAgentTheme } from '@/contexts/agent-theme-context'
import { AnimatedSection } from '@/components/ui/animated-section'
import { useAgent } from '@/hooks/use-agents'
import { Loading } from "@/components/ui/loading"

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
  const { agent, isLoading, error } = useAgent({ id: agentId })
  const theme = useAgentTheme()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  if (error || !agent) {
    return <AgentNotFound />
  }

  return (
    <>
      <AgentHeader agent={agent} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimatedSection className="lg:col-span-2 space-y-6" direction="left" delay={0.3}>
          <PriceActionCard agent={agent} />
          <TradeHistoryCard agent={agent} />
          <ChatCard agent={agent} />
        </AnimatedSection>

        <AnimatedSection className="space-y-6" direction="right" delay={0.4}>
          <Card className={cn("border-2", theme.cardStyle)}>
            <SwapWidget agent={agent} />
          </Card>
          <BondingCurveChart agent={agent} />
          <AgentStatsCard agent={agent} />
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