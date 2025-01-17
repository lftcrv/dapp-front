import { useWallet } from '@/lib/wallet-context'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { 
  Loader2, Timer, TrendingUp, DollarSign, 
  Rocket, Info, Brain, HelpCircle,
  ChevronRight, Flame, Trophy, Crown
} from 'lucide-react'
import { useProtocolFees } from '@/hooks/use-protocol-fees'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function ProtocolFees() {
  const { address } = useWallet()
  const { 
    feesData, 
    timeLeft, 
    isLoading,
    error,
    userShare,
    userSharePercentage,
    isClaiming,
    claimRewards
  } = useProtocolFees()

  if (address && isLoading) {
    return (
      <Card className="p-4 flex items-center justify-center h-[120px] mb-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4 flex items-center justify-center h-[120px] mb-4 text-sm text-muted-foreground">
        Failed to load protocol fees
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Protocol Stats */}
        <Card className="col-span-2 p-6 space-y-6 border-2 border-primary/20 hover:border-primary/40 transition-colors bg-gradient-to-br from-background to-background/50">
          {/* Total Protocol Fees */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-primary animate-pulse" />
                <span className="font-bold text-lg tracking-tight">Protocol Fees</span>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-[200px] text-sm">
                    Total protocol fees generated since launch. Distributed to $LEFT holders based on their curve position.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
              {address && feesData ? feesData.totalFees : '-'} $LEFT
            </div>
          </div>

          {/* Next Distribution Timer */}
          <div className="bg-background/50 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                <span className="font-medium">Next Distribution</span>
              </div>
              <div className="text-3xl font-mono font-bold text-primary tracking-widest animate-glow">
                {address ? timeLeft : '-'}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm">Your Share: {address ? userShare : '-'} $LEFT</span>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-3 border border-primary/20 bg-background/50 hover:bg-background transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Period Fees</span>
              </div>
              <div className="text-lg font-bold">{address && feesData ? feesData.periodFees : '-'} $LEFT</div>
            </Card>
            <Card className="p-3 border border-primary/20 bg-background/50 hover:bg-background transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Your Position</span>
              </div>
              <div className="text-lg font-bold">Top {address ? userSharePercentage : '-'}%</div>
            </Card>
            <Card className="p-3 border border-primary/20 bg-background/50 hover:bg-background transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Distribution</span>
              </div>
              <div className="text-lg font-bold">{address && feesData ? userShare : '-'} $LEFT</div>
            </Card>
          </div>

          {/* Claim Button */}
          <Button
            className={cn(
              "w-full font-medium text-lg py-6 group relative overflow-hidden",
              (!address || Number(userShare) === 0) ? "opacity-50" : "animate-pulse hover:animate-none"
            )}
            disabled={!address || Number(userShare) === 0 || isClaiming}
            onClick={claimRewards}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {!address 
                ? "Connect Wallet to Claim"
                : Number(userShare) === 0
                  ? "No Rewards Available"
                  : isClaiming
                    ? "Claiming..."
                    : <>
                        Claim {userShare} $LEFT
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
              }
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 group-hover:opacity-100 opacity-0 transition-opacity" />
          </Button>
        </Card>

        {/* Distribution Info */}
        <Card className="p-6 space-y-4 border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg tracking-tight">Distribution</span>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-sm">
                  Protocol fees are distributed based on your position in the curve. Higher positions receive a larger share.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {address && feesData ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-sm">Your Position</span>
                  </div>
                  <span className="font-bold">Top {userSharePercentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm">Period Fees</span>
                  </div>
                  <span className="font-bold">{feesData.periodFees} $LEFT</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Distribution Tiers</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">LeftCurve</span>
                    <span>{feesData.distribution.leftCurve.percentage}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">RightCurve</span>
                    <span>{feesData.distribution.rightCurve.percentage}%</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Connect wallet to view distribution details
            </div>
          )}
        </Card>
      </div>
    </TooltipProvider>
  )
}