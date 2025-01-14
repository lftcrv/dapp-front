import { useState, useEffect } from 'react'
import { Trade } from '@/lib/types'
import { tradeService } from '@/lib/services/api/trades'

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
        
        let data: Trade[]
        if (agentId) {
          data = await tradeService.getTradesByAgent(agentId)
        } else {
          data = await tradeService.getAllTrades()
        }
        
        const paginatedTrades = data.slice(0, page * limit)
        setTrades(paginatedTrades)
        setHasMore(paginatedTrades.length < data.length)
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