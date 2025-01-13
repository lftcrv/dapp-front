'use client'

import { Agent } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface BondingCurveChartProps {
  agent: Agent
}

export function BondingCurveChart({ agent }: BondingCurveChartProps) {
  // TODO: Replace with real chart implementation
  // For now, show a simple progress bar
  const progress = Math.min((agent.holders * agent.price * 1000) / 10000 * 100, 100)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Bonding Progress</h3>
          <p className="text-sm text-muted-foreground">Target: 10,000 LEFT</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{progress.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">
            {(agent.holders * agent.price * 1000).toLocaleString()} / 10,000 LEFT
          </p>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-sm text-muted-foreground mb-1">Current Price</h4>
          <p className="font-mono text-lg">${agent.price}</p>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm text-muted-foreground mb-1">Next Price</h4>
          <p className="font-mono text-lg">${(agent.price * 1.1).toFixed(3)}</p>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>* Price increases by 10% for each 1,000 LEFT in liquidity</p>
      </div>
    </div>
  )
} 