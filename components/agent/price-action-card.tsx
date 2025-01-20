import { TrendingUp } from 'lucide-react'
import { Agent } from '@/lib/types'
import { AgentCard } from '@/components/ui/agent-card'
import { PriceChart } from '@/components/price-chart'
import { isInBondingPhase } from '@/lib/utils'
import { useAgentTheme } from '@/lib/agent-theme-context'
import { usePrices } from '@/hooks/use-prices'
import { Loading } from "@/components/ui/loading"

interface PriceActionCardProps {
  agent: Agent
}

export function PriceActionCard({ agent }: PriceActionCardProps) {
  const { prices, isLoading, error } = usePrices({ symbol: agent.symbol })
  const theme = useAgentTheme()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loading variant={theme.mode as "leftcurve" | "rightcurve"} />
      </div>
    )
  }

  if (error) {
    return <div>Error loading price data</div>
  }

  return (
    <AgentCard
      title="Price Action"
      icon={TrendingUp}
      badge={theme.mode}
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