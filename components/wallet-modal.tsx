'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'

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
  const [showMetaMaskTerms, setShowMetaMaskTerms] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleMetaMaskClick = () => {
    setShowMetaMaskTerms(true)
  }

  const handleTermsAccepted = () => {
    if (!termsAccepted) return
    setShowMetaMaskTerms(false)
    onConnectMetamask()
  }

  if (showMetaMaskTerms) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect with MetaMask</DialogTitle>
            <DialogDescription>
              You will receive a signature request. Signing is free and will not send
              a transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              By connecting a wallet, you agree to Leftcurve Terms of Service and
              represent and warrant to Leftcurve that you are not a Restricted
              Person.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Generate Leftcurve wallet</p>
              <p className="text-xs text-gray-500">(Starknet wallet abstracted)</p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the Terms of Service
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowMetaMaskTerms(false)
                setTermsAccepted(false)
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTermsAccepted}
              disabled={!termsAccepted}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect to Leftcurve
          </DialogDescription>
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
            onClick={handleMetaMaskClick}
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