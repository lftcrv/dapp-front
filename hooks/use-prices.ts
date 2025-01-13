import { useState, useEffect } from 'react'
import type { PriceData } from '@/lib/types'
import pricesData from '@/data/prices.json'

interface UsePricesOptions {
  symbol?: string
  initialData?: PriceData[]
}

type PricesData = {
  prices: {
    [key: string]: PriceData[]
  }
}

export function usePrices({ symbol, initialData }: UsePricesOptions = {}) {
  const [prices, setPrices] = useState<PriceData[]>(initialData || [])
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPrices() {
      try {
        setIsLoading(true)
        setError(null)
        const data = symbol ? (pricesData as PricesData).prices[symbol] || [] : []
        setPrices(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch prices'))
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialData && symbol) {
      fetchPrices()
    }
  }, [symbol, initialData])

  return { prices, isLoading, error }
} 