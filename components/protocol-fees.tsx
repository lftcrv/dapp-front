import { useWallet } from '@/lib/wallet-context'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { Loader2, Timer, TrendingUp, DollarSign, Rocket, Info } from 'lucide-react'
import { useProtocolFees } from '@/hooks/use-protocol-fees'

export function ProtocolFees() {
  const { address } = useWallet()
  const { 
    feesData, 
    timeLeft, 
    isLoading,
    error,
    userShare,
    isClaiming,
    claimRewards
  } = useProtocolFees()

  if (!address || isLoading) {
    return (
      <Card className="p-4 flex items-center justify-center h-[120px]">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4 flex items-center justify-center h-[120px] text-sm text-muted-foreground">
        Failed to load protocol fees
      </Card>
    )
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          <span className="font-medium">Protocol Fees</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Total: {feesData?.totalFees || 0} $LEFT</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="text-sm">Your Share: {userShare || 0} $LEFT</span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <span className="text-sm">Time Left: {String(timeLeft) || '0h 0m'}</span>
        </div>
      </div>

      <div className="pt-2">
        <Button
          className={cn(
            "w-full font-medium",
            Number(userShare) === 0 && "opacity-50",
            "transition-all duration-300"
          )}
          disabled={!address || Number(userShare) === 0 || isClaiming}
          onClick={claimRewards}
        >
          {!address 
            ? "Connect Wallet to Claim $LEFT"
            : Number(userShare) === 0
              ? "No Rewards Available"
              : isClaiming
                ? "Claiming..."
                : `Claim ${userShare} $LEFT`
          }
        </Button>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2">
        <Info className="h-4 w-4 flex-shrink-0" />
        <p>
          Protocol fees are distributed to $LEFT holders proportional to their holdings.
          Claim your share before the timer runs out!
        </p>
      </div>
    </Card>
  )
} 