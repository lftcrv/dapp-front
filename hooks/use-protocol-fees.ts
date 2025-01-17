import { useEffect, useState } from 'react'
import { useWallet } from '@/lib/wallet-context'
import { protocolFeesService } from '@/lib/services/api/protocol-fees'
import { useToast } from '@/hooks/use-toast'
import { ApiResponse, ProtocolFeesData } from '@/lib/types'

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function useProtocolFees() {
  const { address } = useWallet()
  const { toast } = useToast()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [feesData, setFeesData] = useState<ProtocolFeesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFeesData = async () => {
    try {
      setIsLoading(true)
      const result = await protocolFeesService.getProtocolFees()
      if (result.success && result.data) {
        setFeesData(result.data)
        setError(null)
      } else {
        setError(result.error?.message || 'Failed to fetch protocol fees')
      }
    } catch (error) {
      setError('Failed to fetch protocol fees')
      console.error('Failed to fetch protocol fees:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const claimRewards = async () => {
    if (!address) return

    try {
      setIsClaiming(true)
      const result = await protocolFeesService.claimRewards(address)
      if (result.success) {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim rewards",
        variant: "destructive"
      })
    } finally {
      setIsClaiming(false)
    }
  }

  useEffect(() => {
    fetchFeesData()
  }, [])

  useEffect(() => {
    if (!feesData) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = new Date(feesData.periodEndTime).getTime() - now

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [feesData])

  const formatTimeLeft = (time: TimeLeft) => {
    const { hours, minutes, seconds } = time
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getUserShare = () => {
    if (!address || !feesData) return "0"
    return feesData.userShares[address] || "0"
  }

  const getUserSharePercentage = () => {
    if (!address || !feesData) return "0"
    
    const leftCurveGainer = feesData.distribution.leftCurve.topGainers.find(g => g.address === address)
    const rightCurveGainer = feesData.distribution.rightCurve.topGainers.find(g => g.address === address)
    
    if (leftCurveGainer) return leftCurveGainer.percentage
    if (rightCurveGainer) return rightCurveGainer.percentage
    return "0"
  }

  return {
    feesData,
    timeLeft: formatTimeLeft(timeLeft),
    isLoading,
    error,
    userShare: getUserShare(),
    userSharePercentage: getUserSharePercentage(),
    isClaiming,
    claimRewards
  }
} 