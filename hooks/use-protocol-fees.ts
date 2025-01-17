import { useEffect, useState, useCallback, useMemo } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { protocolFeesService } from '@/lib/services/api/protocol-fees'
import { useAsyncState } from '@/lib/core/state'
import { useToast } from '@/hooks/use-toast'
import { ProtocolFeesData } from '@/lib/types'

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const DEFAULT_TIME_LEFT: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

export function useProtocolFees() {
  const { address, walletType } = useWallet()
  const { toast } = useToast()
  const { data, isLoading, error, setLoading, handleResult } = useAsyncState<ProtocolFeesData>()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(DEFAULT_TIME_LEFT)
  const [isClaiming, setIsClaiming] = useState(false)

  // Memoize the service call to prevent re-renders
  const getFeesData = useMemo(() => protocolFeesService.getData, [])
  const claimFeesRewards = useMemo(() => protocolFeesService.claimRewards, [])

  const fetchFeesData = useCallback(async () => {
    if (!address) return
    setLoading(true)
    const result = await getFeesData()
    handleResult(result)
  }, [address, getFeesData, setLoading, handleResult])

  const claimRewards = useCallback(async () => {
    if (!address) return

    try {
      setIsClaiming(true)
      const result = await claimFeesRewards(address)
      
      if (result.success && result.data && 'claimed' in result.data) {
        toast({
          title: "Success",
          description: `Claimed ${result.data.claimed} $LEFT`,
        })
        await fetchFeesData()
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to claim rewards",
          variant: "destructive"
        })
      }
    } finally {
      setIsClaiming(false)
    }
  }, [address, claimFeesRewards, toast, fetchFeesData])

  // Memoize time calculation to prevent re-renders
  const calculateTimeLeft = useCallback(() => {
    if (!data?.periodEndTime) return DEFAULT_TIME_LEFT

    const now = new Date().getTime()
    const distance = new Date(data.periodEndTime).getTime() - now

    if (distance < 0) {
      return DEFAULT_TIME_LEFT
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    }
  }, [data?.periodEndTime])

  // Memoize timer effect dependencies
  const updateTimeLeft = useCallback(() => {
    setTimeLeft(calculateTimeLeft())
  }, [calculateTimeLeft])

  useEffect(() => {
    // Initial calculation
    updateTimeLeft()

    // Only set up timer if we have an end time
    if (!data?.periodEndTime) return

    const timer = setInterval(updateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [data?.periodEndTime, updateTimeLeft])

  const formatTimeLeft = useCallback((time: TimeLeft) => {
    const { hours, minutes, seconds } = time
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const getUserShare = useCallback(() => {
    if (!address || !data?.userShares) return "0"
    return data.userShares[address] || "0"
  }, [address, data?.userShares])

  const getUserSharePercentage = useCallback(() => {
    if (!address || !data?.distribution) return "0"
    
    const { leftCurve, rightCurve } = data.distribution
    const leftCurveGainer = leftCurve.topGainers.find(g => g.address === address)
    const rightCurveGainer = rightCurve.topGainers.find(g => g.address === address)
    
    if (leftCurveGainer) return leftCurveGainer.percentage
    if (rightCurveGainer) return rightCurveGainer.percentage
    return "0"
  }, [address, data?.distribution])

  // Initial data fetch with debounce
  useEffect(() => {
    if (!address) return
    
    const timer = setTimeout(() => {
      fetchFeesData()
    }, 100) // Small debounce to prevent rapid re-fetches

    return () => clearTimeout(timer)
  }, [address, fetchFeesData])

  // Memoize all computed values
  const memoizedTimeLeft = useMemo(() => formatTimeLeft(timeLeft), [formatTimeLeft, timeLeft])
  const memoizedUserShare = useMemo(() => getUserShare(), [getUserShare])
  const memoizedUserSharePercentage = useMemo(() => getUserSharePercentage(), [getUserSharePercentage])
  const memoizedFeesData = useMemo(() => data, [data])

  return {
    feesData: memoizedFeesData,
    timeLeft: memoizedTimeLeft,
    isLoading,
    error,
    userShare: memoizedUserShare,
    userSharePercentage: memoizedUserSharePercentage,
    isClaiming,
    claimRewards
  }
} 