import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface MetaMaskModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  onDisconnect: () => void
}

export function MetaMaskModal({
  isOpen,
  onClose,
  onContinue,
  onDisconnect,
}: MetaMaskModalProps) {
  const [rememberMe, setRememberMe] = React.useState(false)

  const handleContinue = () => {
    if (!rememberMe) return
    onContinue()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the Terms of Service
            </label>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onDisconnect}>
            Cancel
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!rememberMe}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 