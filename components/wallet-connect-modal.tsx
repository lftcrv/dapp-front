'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@/lib/wallet-context';
import { useState, useEffect } from 'react';

export function WalletConnectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'choose' | 'evm-terms'>('choose');
  const { login: privyLogin, logout: privyLogout, ready: privyReady, authenticated } = usePrivy();
  const { connectToStarknet, disconnect: disconnectStarknet, isConnecting: isStarknetConnecting } = useWallet();
  const [rememberMe, setRememberMe] = useState(false);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('choose');
    }
  }, [isOpen]);

  const handleEVMConnect = async () => {
    try {
      // First disconnect any existing Starknet connection
      await disconnectStarknet();
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      // Then connect EVM
      await privyLogin();
      onClose();
    } catch (error) {
      console.error('Failed to connect EVM wallet:', error);
    }
  };

  const handleStarknetConnect = async () => {
    try {
      // Close the modal first to prevent UI issues
      onClose();
      
      // If Privy is authenticated, logout first
      if (privyReady && authenticated) {
        await privyLogout();
        // Wait for Privy cleanup
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Wait a bit more to ensure all states are cleaned up
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then try to connect Starknet
      if (!isStarknetConnecting) {
        await connectToStarknet();
      }
    } catch (error) {
      if (error instanceof Error && !error.message.includes('User rejected')) {
        console.error('Failed to connect Starknet wallet:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        {step === 'choose' && (
          <>
            <DialogHeader>
              <DialogTitle>Connect your Wallet</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                By connecting a wallet, you agree to Paradex Terms of Service and represent and warrant 
                to Paradex that you are not a Restricted Person.
              </p>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button
                onClick={() => setStep('evm-terms')}
                className="w-full"
                variant="outline"
              >
                Choose EVM Wallet
              </Button>
              <Button
                onClick={handleStarknetConnect}
                className="w-full"
                variant="outline"
                disabled={isStarknetConnecting}
              >
                {isStarknetConnecting ? 'Connecting...' : 'Starknet Wallet'}
              </Button>
            </div>
          </>
        )}

        {step === 'evm-terms' && (
          <>
            <DialogHeader>
              <DialogTitle>Link Wallet</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                You will receive a signature request. Signing is free and will not send a transaction.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                By connecting a wallet, you agree to Paradex Terms of Service and represent and warrant 
                to Paradex that you are not a Restricted Person.
              </p>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="remember" className="text-sm">
                  Remember Me
                </label>
              </div>
              <Button onClick={handleEVMConnect} className="w-full">
                Continue
              </Button>
              <Button
                onClick={() => setStep('choose')}
                variant="outline"
                className="w-full"
              >
                Back
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 