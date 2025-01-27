'use client'

import { useState, useEffect } from 'react'
import { simulateBuyTokens, simulateSellTokens, getBondingCurvePercentage } from '@/actions/agents/token/getTokenInfo'

interface UseBondingCurveProps {
  agentId: string
  interval?: number // Polling interval in ms
}

interface BondingCurveData {
  buyPrice: bigint | null
  sellPrice: bigint | null
  percentage: number | null
  isLoading: boolean
  error: string | null
}

export function useBondingCurve({ agentId, interval = 5000 }: UseBondingCurveProps): BondingCurveData {
  const [data, setData] = useState<BondingCurveData>({
    buyPrice: null,
    sellPrice: null,
    percentage: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      // Skip API calls if no agentId is provided
      if (!agentId) {
        setData({
          buyPrice: null,
          sellPrice: null,
          percentage: null,
          isLoading: false,
          error: null
        })
        return
      }

      try {
        // Simulate prices for 1 token (18 decimals)
        const [buyResult, sellResult, percentageResult] = await Promise.all([
          simulateBuyTokens(agentId, "1000000000000000000"),
          simulateSellTokens(agentId, "1000000000000000000"),
          getBondingCurvePercentage(agentId)
        ])

        if (!mounted) return

        // Check each result individually for better error messages
        if (!buyResult.success) {
          throw new Error(buyResult.error || 'Failed to simulate buy')
        }
        if (!sellResult.success) {
          throw new Error(sellResult.error || 'Failed to simulate sell')
        }
        if (!percentageResult.success) {
          throw new Error(percentageResult.error || 'Failed to get bonding curve percentage')
        }

        setData({
          buyPrice: buyResult.data ?? null,
          sellPrice: sellResult.data ?? null,
          percentage: percentageResult.data ?? null,
          isLoading: false,
          error: null
        })
      } catch (error) {
        if (!mounted) return
        setData(prev => ({
          ...prev,
          buyPrice: null,
          sellPrice: null,
          percentage: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      }
    }

    fetchData()
    const timer = interval > 0 ? setInterval(fetchData, interval) : null

    return () => {
      mounted = false
      if (timer) clearInterval(timer)
    }
  }, [agentId, interval])

  return data
} 