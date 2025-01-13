'use client'

import { useState } from 'react'
import { Agent } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWallet } from '@/lib/wallet-context'
import { ArrowDownUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SwapWidgetProps {
  agent: Agent
}

export function SwapWidget({ agent }: SwapWidgetProps) {
  const [amount, setAmount] = useState('')
  const { address, isConnected } = useWallet()
  const { toast } = useToast()

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
    <div className="space-y-4">
      <h3 className="font-medium">Trade {agent.name}</h3>
      
      <Tabs defaultValue="buy">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Pay with LEFT</label>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="text-right text-xs text-muted-foreground">
              Balance: 0.00 LEFT
            </div>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center justify-center">
              <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Receive {agent.name}</label>
            <Input
              type="number"
              placeholder="0.0"
              value={amount ? (parseFloat(amount) / agent.price).toFixed(6) : ''}
              readOnly
            />
            <div className="text-right text-xs text-muted-foreground">
              Price: ${agent.price} per token
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSwap}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {isConnected ? 'Buy Tokens' : 'Connect Wallet'}
          </Button>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Sell {agent.name}</label>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="text-right text-xs text-muted-foreground">
              Balance: 0.00 {agent.name}
            </div>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center justify-center">
              <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Receive LEFT</label>
            <Input
              type="number"
              placeholder="0.0"
              value={amount ? (parseFloat(amount) * agent.price).toFixed(6) : ''}
              readOnly
            />
            <div className="text-right text-xs text-muted-foreground">
              Price: ${agent.price} per token
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSwap}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {isConnected ? 'Sell Tokens' : 'Connect Wallet'}
          </Button>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground">
        * Price may change due to bonding curve mechanics
      </div>
    </div>
  )
} 