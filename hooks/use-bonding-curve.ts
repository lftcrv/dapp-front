'use client'

import { useState, useEffect, useRef } from 'react'
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
  isInBondingPhase: boolean
}

export function useBondingCurve({ agentId, interval = 5000 }: UseBondingCurveProps): BondingCurveData {
  const [data, setData] = useState<BondingCurveData>({
    buyPrice: null,
    sellPrice: null,
    percentage: null,
    isLoading: true,
    error: null,
    isInBondingPhase: true
  })

  // Use a ref to track if we've detected a 404 to avoid re-renders
  const hasTokenNotFoundRef = useRef(false)

  useEffect(() => {
    let mounted = true
    let timer: NodeJS.Timeout | null = null

    async function fetchData() {
      // Skip API calls if no agentId is provided
      if (!agentId) {
        setData({
          buyPrice: null,
          sellPrice: null,
          percentage: null,
          isLoading: false,
          error: null,
          isInBondingPhase: true
        })
        return
      }

      try {
        // If we already got a 404, don't make more API calls
        if (hasTokenNotFoundRef.current) {
          return
        }

        // Simulate prices for 1 token (18 decimals)
        const [buyResult, sellResult, percentageResult] = await Promise.all([
          simulateBuyTokens(agentId, "1000000000000000000"),
          simulateSellTokens(agentId, "1000000000000000000"),
          getBondingCurvePercentage(agentId)
        ])

        if (!mounted) return

        // For new agents without tokens, we'll get 404s - this is expected
        const isNewAgent = [buyResult, sellResult, percentageResult].some(
          result => !result.success && result.error?.includes('not found')
        )

        if (isNewAgent) {
          hasTokenNotFoundRef.current = true
          // Clear any existing timer
          if (timer) {
            clearInterval(timer)
            timer = null
          }
          setData({
            buyPrice: null,
            sellPrice: null,
            percentage: null,
            isLoading: false,
            error: "Token contract not deployed yet. Please wait for deployment to complete.",
            isInBondingPhase: true
          })
          return
        }

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
          error: null,
          isInBondingPhase: true
        })
      } catch (error) {
        if (!mounted) return
        setData(prev => ({
          ...prev,
          buyPrice: null,
          sellPrice: null,
          percentage: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          isInBondingPhase: true
        }))
      }
    }

    // Initial fetch
    fetchData()

    // Only set up polling if we haven't detected a 404
    if (!hasTokenNotFoundRef.current && interval > 0) {
      timer = setInterval(fetchData, interval)
    }

    return () => {
      mounted = false
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [agentId, interval])

  return data
} 