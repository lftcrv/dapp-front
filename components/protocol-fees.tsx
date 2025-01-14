import { useWallet } from '@/lib/wallet-context'
import { cn } from '@/lib/utils'
import { Info, Timer, Wallet, TrendingUp, DollarSign, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProtocolFees } from '@/hooks/use-protocol-fees'

export function ProtocolFees() {
  const { isConnected } = useWallet()
  const { 
    feesData, 
    timeLeft, 
    userShare, 
    userSharePercentage, 
    isLoading, 
    isClaiming,
    error,
    claimRewards 
  } = useProtocolFees()

  if (error) {
    return (
      <div className="w-full mb-8 text-xs text-red-500">
        Failed to load protocol fees data
      </div>
    )
  }

  if (isLoading || !feesData) {
    return (
      <div className="w-full mb-8">
        <div className="relative p-[1px] rounded-lg overflow-hidden">
          <div className="absolute inset-0 border border-yellow-500/30" />
          <div className="relative rounded-lg">
            <div className="h-[300px] animate-pulse bg-white/5" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mb-8">
      <div className="relative p-[1px] rounded-lg overflow-hidden">
        <div className="absolute inset-0 border border-yellow-500/30" />
        <div className="relative rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Stats Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-yellow-500" />
                <h2 className="text-base font-mono font-bold text-neutral-900">$LEFT Distribution</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 text-yellow-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Total $LEFT</div>
                    <div className="font-mono text-sm text-neutral-900">{feesData.totalFees}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 mt-0.5 text-purple-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Period $LEFT</div>
                    <div className="font-mono text-sm text-neutral-900">{feesData.periodFees}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Timer className="w-4 h-4 mt-0.5 text-yellow-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Time Left</div>
                    <div className="font-mono text-xs text-neutral-900">
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Wallet className="w-4 h-4 mt-0.5 text-purple-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Your $LEFT</div>
                    <div className="font-mono text-sm text-neutral-900">
                      {userShare} ({userSharePercentage}%)
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                className={cn(
                  "w-full font-mono text-xs text-neutral-900",
                  "bg-gradient-to-r from-yellow-500/20 to-purple-500/20",
                  "hover:from-yellow-500/30 hover:to-purple-500/30",
                  "border border-yellow-500/30 hover:border-purple-500/30",
                  "transition-all duration-300"
                )}
                disabled={!isConnected || Number(userShare) === 0 || isClaiming}
                onClick={claimRewards}
              >
                {!isConnected 
                  ? "Connect Wallet to Claim $LEFT"
                  : Number(userShare) === 0
                  ? "No $LEFT to Claim"
                  : isClaiming
                  ? "Claiming..."
                  : "Claim Your $LEFT"}
              </Button>
            </div>

            {/* Info Section */}
            <div className="relative p-[1px] rounded-lg overflow-hidden ">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-yellow-500/20 animate-gradient" />
              <div className="relative rounded-lg bg-white/5 p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-purple-500/20 border border-white/10">
                    <Info className="w-4 h-4 text-black" />
                  </div>
                  <div className="space-y-3 text-xs">
                    <p className="text-black font-black leading-relaxed">
                      $LEFT is the protocol token used for purchasing agent tokens and launching agents. Protocol fees are distributed in $LEFT to based curves only (no midcurvers ngmi).
                    </p>
                    <div className="space-y-2">
                      <p className="text-black font-medium">Distribution:</p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-3 bg-yellow-500/10 rounded-lg p-2.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                          <span className="text-yellow-800">{feesData.distribution.leftCurve.percentage}% to {feesData.distribution.leftCurve.description}</span>
                        </li>
                        <li className="flex items-center gap-3 bg-purple-500/10 rounded-lg p-2.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                          <span className="text-purple-800">{feesData.distribution.rightCurve.percentage}% to {feesData.distribution.rightCurve.description}</span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-black/50 text-[10px] italic pt-1">
                      claim your $LEFT before period ends or ngmi fr fr
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 