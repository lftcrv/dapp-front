import { Rocket } from 'lucide-react'
import { Agent } from '@/lib/types'
import { AgentCard } from '@/components/ui/agent-card'
import { TradeHistory } from '@/components/trade-history'

interface TradeHistoryCardProps {
  agent: Agent
}

export function TradeHistoryCard({ agent }: TradeHistoryCardProps) {
  return (
    <AgentCard
      title="Recent Trades"
      icon={Rocket}
      badge="LIVE FEED"
    >
      <TradeHistory />
    </AgentCard>
  )
} 