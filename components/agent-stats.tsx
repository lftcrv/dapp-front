import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Performance } from '@/lib/types'

interface AgentStatsProps {
  performance: Performance
}

export function AgentStats({ performance }: AgentStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-mono">Performance Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
            <div className="text-2xl font-bold">{performance.successRate}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Profit/Loss</div>
            <div className="text-2xl font-bold">{performance.profitLoss}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Trade Count</div>
            <div className="text-2xl font-bold">{performance.tradeCount}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Performance Score</div>
            <div className="text-2xl font-bold">{performance.performanceScore}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 