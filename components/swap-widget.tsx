'use client'

import { useState } from 'react'
import { Agent } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWallet } from '@/lib/wallet-context'
import { ArrowDownUp, ExternalLink, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface SwapWidgetProps {
  agent: Agent
}

export function SwapWidget({ agent }: SwapWidgetProps) {
  const [amount, setAmount] = useState('')
  const { isConnected } = useWallet()
  const { toast } = useToast()
  const isLeftCurve = agent.type === 'leftcurve'

  const handleSwap = () => {
    if (!isConnected) {
      toast({
        title: 'Connect Wallet',
        description: 'Please connect your wallet to trade.',
        variant: 'destructive'
      })
      return
    }

    // TODO: Implement actual swap logic
    toast({
      title: 'Coming Soon',
      description: 'Trading functionality will be available soon!',
    })
  }

  return (
    <div className="p-6 space-y-4">
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
          Get LINK
          <ExternalLink className="h-3 w-3 opacity-50" />
        </Button>
      </div>
      
      <Tabs defaultValue="buy" className="w-full">
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
          <div className={cn(
            "rounded-lg border-2 p-3 space-y-2",
            isLeftCurve ? "bg-yellow-500/5 border-yellow-500/20" : "bg-purple-500/5 border-purple-500/20"
          )}>
            <div className="flex items-center justify-between text-sm">
              <label className="text-muted-foreground">Pay with LINK</label>
              <span className="font-mono text-xs">Balance: 0.00 LINK</span>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-0 bg-transparent text-lg font-mono"
            />
          </div>

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

          <div className={cn(
            "rounded-lg border-2 p-3 space-y-2",
            isLeftCurve ? "bg-yellow-500/5 border-yellow-500/20" : "bg-purple-500/5 border-purple-500/20"
          )}>
            <div className="flex items-center justify-between text-sm">
              <label className="text-muted-foreground">Receive {agent.name}</label>
              <span className="font-mono text-xs">≈ ${amount ? (parseFloat(amount) * agent.price).toFixed(2) : '0.00'}</span>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={amount ? (parseFloat(amount) / agent.price).toFixed(6) : ''}
              readOnly
              className="border-0 bg-transparent text-lg font-mono"
            />
          </div>

          <Button 
            className={cn(
              "w-full font-medium",
              isLeftCurve 
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" 
                : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            )}
            size="lg"
            onClick={handleSwap}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {isConnected ? 'Swap Tokens' : 'Connect Wallet'}
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Price Impact</span>
            <span className="font-mono">~2.5%</span>
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <div className={cn(
            "rounded-lg border-2 p-3 space-y-2",
            isLeftCurve ? "bg-yellow-500/5 border-yellow-500/20" : "bg-purple-500/5 border-purple-500/20"
          )}>
            <div className="flex items-center justify-between text-sm">
              <label className="text-muted-foreground">Sell {agent.name}</label>
              <span className="font-mono text-xs">Balance: 0.00 {agent.name}</span>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-0 bg-transparent text-lg font-mono"
            />
          </div>

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

          <div className={cn(
            "rounded-lg border-2 p-3 space-y-2",
            isLeftCurve ? "bg-yellow-500/5 border-yellow-500/20" : "bg-purple-500/5 border-purple-500/20"
          )}>
            <div className="flex items-center justify-between text-sm">
              <label className="text-muted-foreground">Receive LINK</label>
              <span className="font-mono text-xs">≈ ${amount ? (parseFloat(amount) * agent.price).toFixed(2) : '0.00'}</span>
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={amount ? (parseFloat(amount) * agent.price).toFixed(6) : ''}
              readOnly
              className="border-0 bg-transparent text-lg font-mono"
            />
          </div>

          <Button 
            className={cn(
              "w-full font-medium",
              isLeftCurve 
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" 
                : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            )}
            size="lg"
            onClick={handleSwap}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {isConnected ? 'Swap Tokens' : 'Connect Wallet'}
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
} 