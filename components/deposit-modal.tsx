import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

const TOKENS = [
  { id: 'eth', name: 'ETH', icon: '⟠' },
  { id: 'usdc', name: 'USDC', icon: '$' },
]

const BRIDGES = [
  { 
    id: 'orbiter', 
    name: 'Orbiter Finance',
    url: (token: string) => `https://www.orbiter.finance/?source=Ethereum&dest=Starknet&token=${token.toUpperCase()}`
  },
  { 
    id: 'layerswap', 
    name: 'LayerSwap',
    url: (token: string) => `https://www.layerswap.io/?destNetwork=STARKNET&sourceNetwork=ETHEREUM&asset=${token.toUpperCase()}`
  },
]

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = React.useState('')
  const [selectedToken, setSelectedToken] = React.useState(TOKENS[0].id)
  const [selectedBridge, setSelectedBridge] = React.useState(BRIDGES[0].id)

  const handleDeposit = () => {
    const bridge = BRIDGES.find(b => b.id === selectedBridge)
    if (bridge) {
      window.open(bridge.url(selectedToken), '_blank')
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit to Starknet</DialogTitle>
          <DialogDescription>
            Choose the amount, token, and bridge to deposit funds to Starknet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="amount"
              placeholder="0.0"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Token</label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    <span className="flex items-center gap-2">
                      <span>{token.icon}</span>
                      <span>{token.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Bridge</label>
            <Select value={selectedBridge} onValueChange={setSelectedBridge}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRIDGES.map((bridge) => (
                  <SelectItem key={bridge.id} value={bridge.id}>
                    {bridge.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeposit}
            disabled={!amount || parseFloat(amount) <= 0}
            className="bg-gradient-to-r from-[#F76B2A] to-[#A047E4] text-white hover:opacity-90"
          >
            Deposit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 