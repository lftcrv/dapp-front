'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

interface WalletModalProps {
  open: boolean
  onClose: () => void
  onConnectStarknet: () => Promise<void>
  onConnectMetamask: () => Promise<void>
}

export function WalletModal({ 
  open, 
  onClose, 
  onConnectStarknet,
  onConnectMetamask 
}: WalletModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="flex items-center justify-start gap-4 p-6 hover:bg-white/5"
            onClick={onConnectStarknet}
          >
            <span className="text-2xl">🚀</span>
            <div className="flex flex-col items-start gap-1">
              <span className="font-bold">StarkNet</span>
              <span className="text-sm text-muted-foreground">Connect with Braavos or Argent X</span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-start gap-4 p-6 hover:bg-white/5"
            onClick={onConnectMetamask}
          >
            <span className="text-2xl">🦊</span>
            <div className="flex flex-col items-start gap-1">
              <span className="font-bold">MetaMask</span>
              <span className="text-sm text-muted-foreground">Connect to Ethereum</span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 