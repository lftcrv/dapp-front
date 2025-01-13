import { Card } from '@/components/ui/card'
import { Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Agent } from '@/lib/types'

interface AgentStatsCardProps {
  agent: Agent
}

export function AgentStatsCard({ agent }: AgentStatsCardProps) {
  const isLeftCurve = agent.type === 'leftcurve'

  return (
    <Card className={cn(
      "p-6 border-2",
      isLeftCurve ? "hover:border-yellow-500/50" : "hover:border-purple-500/50"
    )}>
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <Brain className={cn(
          "h-4 w-4",
          isLeftCurve ? "text-yellow-500" : "text-purple-500"
        )} />
        Performance Stats
      </h3>
      <div className="space-y-3 text-sm">
        <div className={cn(
          "flex justify-between items-center p-2 rounded-lg",
          isLeftCurve ? "bg-yellow-500/5" : "bg-purple-500/5"
        )}>
          <span className="text-muted-foreground">Price</span>
          <span className="font-mono font-bold">${agent.price.toFixed(4)}</span>
        </div>
        <div className={cn(
          "flex justify-between items-center p-2 rounded-lg",
          isLeftCurve ? "bg-yellow-500/5" : "bg-purple-500/5"
        )}>
          <span className="text-muted-foreground">Holders</span>
          <span className="font-mono font-bold">{agent.holders.toLocaleString()}</span>
        </div>
        <div className={cn(
          "flex justify-between items-center p-2 rounded-lg",
          isLeftCurve ? "bg-yellow-500/5" : "bg-purple-500/5"
        )}>
          <span className="text-muted-foreground">Market Cap</span>
          <span className="font-mono font-bold">
            ${(agent.price * agent.holders * 1000).toLocaleString()}
          </span>
        </div>
        {isLeftCurve ? (
          <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
            <span className="text-yellow-500">Degen Score</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-yellow-500">
                {agent.creativityIndex?.toFixed(2)}
              </span>
              <span className="text-xl">🦧</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20">
            <span className="text-purple-500">Win Rate</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-purple-500">
                {(agent.performanceIndex || 0 * 100).toFixed(1)}%
              </span>
              <span className="text-xl">🐙</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 