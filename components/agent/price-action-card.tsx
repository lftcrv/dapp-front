import { TrendingUp } from 'lucide-react'
import { Agent } from '@/lib/types'
import { AgentCard } from '@/components/ui/agent-card'
import { PriceChart } from '@/components/price-chart'
import { isInBondingPhase } from '@/lib/utils'
import { getDummyPriceData } from '@/lib/dummy-prices'
import { useAgentTheme } from '@/contexts/agent-theme-context'

interface PriceActionCardProps {
  agent: Agent
}

export function PriceActionCard({ agent }: PriceActionCardProps) {
  const theme = useAgentTheme()

  return (
    <AgentCard
      title="Price Action"
      icon={TrendingUp}
      badge={theme.mode}
    >
      <PriceChart 
        data={getDummyPriceData(agent.symbol, agent.price)} 
        symbol={agent.symbol}
        baseToken={agent.symbol}
        inBondingCurve={isInBondingPhase(agent.price, agent.holders)}
      />
    </AgentCard>
  )
} 