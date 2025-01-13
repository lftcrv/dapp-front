'use client'

import { useState, useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { dummyTrades, Trade } from '@/lib/dummy-trades'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export function TradeHistory() {
  const [trades, setTrades] = useState<Trade[]>(dummyTrades.slice(0, 5))
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const loadMoreTrades = async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In real implementation, this would be a DB query with pagination
    const currentLength = trades.length
    const nextTrades = dummyTrades.slice(currentLength, currentLength + 5)
    
    if (nextTrades.length === 0) {
      setHasMore(false)
    } else {
      setTrades(prev => [...prev, ...nextTrades])
    }
    setLoading(false)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreTrades()
        }
      },
      { threshold: 0.5 }
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => observer.disconnect()
  }, [trades, loading])

  return (
    <ScrollArea className="h-[300px] w-full" ref={scrollRef}>
      <div className="space-y-2 p-4">
        <div className="text-sm font-medium mb-2">Recent Trades</div>
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
              </div>
              <span className="text-[10px] text-muted-foreground">{trade.time}</span>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed truncate max-w-full" title={trade.summary}>
              {trade.summary.length > 240 
                ? `${trade.summary.slice(0, 240)}...` 
                : trade.summary}
            </div>
          </motion.div>
        ))}
        <div ref={loadingRef} className="py-2 text-center">
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading more trades...
            </motion.div>
          )}
          {!hasMore && trades.length > 0 && (
            <span className="text-xs text-muted-foreground">
              No more trades to load
            </span>
          )}
        </div>
      </div>
    </ScrollArea>
  )
} 