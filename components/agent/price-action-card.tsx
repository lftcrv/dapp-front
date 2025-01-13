import { TrendingUp } from 'lucide-react'
import { Agent } from '@/lib/types'
import { AgentCard } from '@/components/ui/agent-card'
import { PriceChart } from '@/components/price-chart'
import { isInBondingPhase } from '@/lib/utils'
import { useAgentTheme } from '@/contexts/agent-theme-context'
import { usePrices } from '@/hooks/use-prices'

interface PriceActionCardProps {
  agent: Agent
}

export function PriceActionCard({ agent }: PriceActionCardProps) {
  const { prices, isLoading, error } = usePrices({ symbol: agent.symbol })

  if (isLoading) {
    return <div>Loading price data...</div>
  }

  if (error) {
    return <div>Error loading price data</div>
  }

  return (
    <AgentCard
      title="Price Action"
      icon={TrendingUp}
      badge={useAgentTheme().mode}
    >
      <PriceChart 
        data={prices} 
        symbol={agent.symbol}
        baseToken={agent.symbol}
        inBondingCurve={isInBondingPhase(agent.price, agent.holders)}
      />
    </AgentCard>
  )
} 