import { useState, useEffect } from 'react'
import { Trade, TradeType } from '@/lib/types'
import tradesData from '@/data/trades.json'

interface UseTradesOptions {
  agentId?: string
  initialData?: Trade[]
  limit?: number
}

export function useTrades({ agentId, initialData, limit = 10 }: UseTradesOptions = {}) {
  const [trades, setTrades] = useState<Trade[]>(initialData || [])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    async function fetchTrades() {
      try {
        setIsLoading(true)
        setError(null)
        const filtered = agentId 
          ? tradesData.trades.filter(t => t.agentId === agentId)
          : tradesData.trades
        const paginatedTrades = filtered.slice(0, page * limit).map(t => ({
          ...t,
          type: t.type as TradeType
        }))
        setTrades(paginatedTrades)
        setHasMore(paginatedTrades.length < filtered.length)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch trades'))
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialData) {
      fetchTrades()
    }
  }, [agentId, page, limit, initialData])

  const loadMore = () => setPage(p => p + 1)

  return { trades, isLoading, error, hasMore, loadMore }
} 