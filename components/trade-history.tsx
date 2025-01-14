'use client'

import { motion } from 'framer-motion'
import { useTrades } from '@/hooks/use-trades'
import { cn } from '@/lib/utils'
import { Loading } from "@/components/ui/loading"
import { useAgentTheme } from '@/contexts/agent-theme-context'

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface TradeHistoryProps {
  agentId?: string // Optional: Filter trades by agent
}

export function TradeHistory({ agentId }: TradeHistoryProps) {
  const theme = useAgentTheme()
  const { trades, isLoading, error, hasMore, loadMore } = useTrades({ agentId })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loading variant={theme.mode as "leftcurve" | "rightcurve"} />
      </div>
    )
  }

  if (error) {
    return <div>Error loading trades</div>
  }

  return (
    <div>
      {trades.map((trade) => (
        <motion.div
          key={trade.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex flex-col space-y-1 rounded-lg border p-2",
            trade.type === 'buy' 
              ? 'bg-green-500/5 border-green-500/20' 
              : 'bg-red-500/5 border-red-500/20'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-sm font-medium",
                trade.type === 'buy' ? 'text-green-500' : 'text-red-500'
              )}>
                {trade.type === 'buy' ? '↗' : '↘'} ${trade.price.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                ({trade.amount.toLocaleString()} tokens)
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {formatTimeAgo(trade.time)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed truncate max-w-full" title={trade.summary}>
            {trade.summary.length > 240 
              ? `${trade.summary.slice(0, 240)}...` 
              : trade.summary}
          </div>
        </motion.div>
      ))}
      {hasMore && (
        <button onClick={loadMore}>Load more</button>
      )}
    </div>
  )
} 