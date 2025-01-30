'use client'

import { memo, useState, useCallback, useMemo, useEffect } from 'react'
import { Agent } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWallet } from '@/app/context/wallet-context'
import { ArrowDownUp, ExternalLink, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { simulateBuyTokens, simulateSellTokens } from '@/actions/agents/token/getTokenInfo'

interface SwapWidgetProps {
  agent: Agent
  className?: string
}

interface SwapInputProps {
  label: string
  balance: string
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  estimate?: string
  isLeftCurve: boolean
}

const SwapInput = memo(({ 
  label, 
  balance, 
  value, 
  onChange, 
  readOnly,
  estimate,
  isLeftCurve
}: SwapInputProps) => (
  <div className={cn(
    "rounded-lg border-2 p-3 space-y-2",
    isLeftCurve ? "bg-yellow-500/5 border-yellow-500/20" : "bg-purple-500/5 border-purple-500/20"
  )}>
    <div className="flex items-center justify-between text-sm">
      <label className="text-muted-foreground">{label}</label>
      <span className="font-mono text-xs">
        {estimate ? `≈ $${estimate}` : `Balance: ${balance}`}
      </span>
    </div>
    <Input
      type="number"
      placeholder="0.0"
      value={value}
      onChange={onChange && ((e) => onChange(e.target.value))}
      readOnly={readOnly}
      className="border-0 bg-transparent text-lg font-mono"
    />
  </div>
))
SwapInput.displayName = 'SwapInput'

const SwapDivider = memo(({ isLeftCurve }: { isLeftCurve: boolean }) => (
  <div className="relative py-2">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-border" />
    </div>
    <div className="relative flex justify-center">
      <div className={cn(
        "rounded-full border-2 p-1.5 bg-background",
        isLeftCurve ? "border-yellow-500/50" : "border-purple-500/50"
      )}>
        <ArrowDownUp className={cn(
          "h-3 w-3",
          isLeftCurve ? "text-yellow-500" : "text-purple-500"
        )} />
      </div>
    </div>
  </div>
))
SwapDivider.displayName = 'SwapDivider'

export const SwapWidget = memo(({ agent, className }: SwapWidgetProps) => {
  const [amount, setAmount] = useState('')
  const [simulatedAmount, setSimulatedAmount] = useState('')
  const [activeTab, setActiveTab] = useState('buy')
  const { currentAddress: address } = useWallet()
  const { toast } = useToast()
  const isLeftCurve = agent.type === 'leftcurve'

  // Simulate swap when amount changes
  useEffect(() => {
    const simulateSwap = async () => {
      if (!amount || !agent.id) {
        setSimulatedAmount('')
        return
      }

      try {
        const inputAmount = parseFloat(amount)
        if (isNaN(inputAmount) || inputAmount === 0 || !isFinite(inputAmount)) {
          setSimulatedAmount('')
          return
        }

        const amountInWei = BigInt(Math.floor(inputAmount * 1e18)).toString()
        const result = await (activeTab === 'buy' 
          ? simulateBuyTokens(agent.id, amountInWei)
          : simulateSellTokens(agent.id, amountInWei))
        
        if (result.success && result.data) {
          const outputAmount = Number(result.data) / 1e18
          setSimulatedAmount(outputAmount.toFixed(6))
        } else {
          setSimulatedAmount('')
        }
      } catch (error) {
        console.error('Failed to simulate swap:', error)
        setSimulatedAmount('')
      }
    }

    const timer = setTimeout(simulateSwap, 500)
    return () => clearTimeout(timer)
  }, [amount, agent.id, activeTab])

  const handleSwap = useCallback(() => {
    if (!address) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to trade.',
        variant: 'destructive'
      })
      return
    }

    toast({
      title: 'Coming Soon',
      description: 'Trading functionality will be available soon!',
    })
  }, [address, toast])

  const buttonText = useMemo(() => {
    if (!address) return "Connect Wallet"
    if (!amount) return "Enter Amount"
    return "Swap"
  }, [address, amount])

  const buttonStyle = useMemo(() => cn(
    "w-full font-medium",
    isLeftCurve 
      ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" 
      : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
  ), [isLeftCurve])

  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <ArrowDownUp className={cn(
            "h-4 w-4",
            isLeftCurve ? "text-yellow-500" : "text-purple-500"
          )} />
          Trade {agent.name}
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-1.5"
          onClick={() => window.open('https://app.avnu.fi', '_blank')}
        >
          <LinkIcon className="h-3 w-3" />
          Get $LEFT
          <ExternalLink className="h-3 w-3 opacity-50" />
        </Button>
      </div>
      
      <Tabs defaultValue="buy" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="buy" className={cn(
            "font-medium",
            isLeftCurve ? "data-[state=active]:text-yellow-500" : "data-[state=active]:text-purple-500"
          )}>Buy</TabsTrigger>
          <TabsTrigger value="sell" className={cn(
            "font-medium",
            isLeftCurve ? "data-[state=active]:text-yellow-500" : "data-[state=active]:text-purple-500"
          )}>Sell</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4">
          <SwapInput
            label="Pay with $LEFT"
            balance="0.00 $LEFT"
            value={amount}
            onChange={(value) => {
              const num = parseFloat(value)
              if (value === '' || (!isNaN(num) && isFinite(num))) {
                setAmount(value)
              }
            }}
            isLeftCurve={isLeftCurve}
          />

          <SwapDivider isLeftCurve={isLeftCurve} />

          <SwapInput
            label={`Receive ${agent.name}`}
            balance={`0.00 ${agent.name}`}
            value={simulatedAmount}
            estimate={amount || '0.00'}
            readOnly
            isLeftCurve={isLeftCurve}
          />

          <Button 
            className={buttonStyle}
            size="lg"
            onClick={handleSwap}
            disabled={!address || !amount}
          >
            {buttonText}
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Price Impact</span>
            <span className="font-mono">~2.5%</span>
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <SwapInput
            label={`Pay with ${agent.name}`}
            balance={`0.00 ${agent.name}`}
            value={amount}
            onChange={(value) => {
              const num = parseFloat(value)
              if (value === '' || (!isNaN(num) && isFinite(num))) {
                setAmount(value)
              }
            }}
            isLeftCurve={isLeftCurve}
          />

          <SwapDivider isLeftCurve={isLeftCurve} />

          <SwapInput
            label="Receive $LEFT"
            balance="0.00 $LEFT"
            value={simulatedAmount}
            estimate={amount || '0.00'}
            readOnly
            isLeftCurve={isLeftCurve}
          />

          <Button 
            className={buttonStyle}
            size="lg"
            onClick={handleSwap}
            disabled={!address || !amount}
          >
            {buttonText}
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Price Impact</span>
            <span className="font-mono">~2.5%</span>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground border-t border-border pt-3">
        * Price increases with each purchase due to bonding curve
      </div>
    </div>
  )
})
SwapWidget.displayName = 'SwapWidget' 