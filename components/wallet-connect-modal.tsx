'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { connect } from 'starknetkit';
import { useState, useEffect } from 'react';
import { showToast } from '@/lib/toast';
import type { StarknetWindowObject } from 'get-starknet-core';

// Helper function for colored console logs
function logPerf(action: string, duration: number, walletType: string = '') {
  console.log('\x1b[36m%s\x1b[0m', `⏱️ ${action}${walletType ? ` (${walletType})` : ''}: ${duration.toFixed(2)}ms`)
}

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onStarknetConnect: (wallet: StarknetWindowObject, address: string) => void
}

export function WalletConnectModal({ isOpen, onClose, onStarknetConnect }: WalletConnectModalProps) {
  const [step, setStep] = useState<'choose' | 'evm-terms'>('choose');
  const { login, ready: privyReady } = usePrivy();
  const [isConnecting, setIsConnecting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('choose');
      setIsConnecting(false);
    }
  }, [isOpen]);

  const handleStarknetConnect = async () => {
    setIsConnecting(true);
    const startTime = performance.now();
    showToast('CONNECTING', 'loading');
    
    // Close the current modal first
    onClose();
    
    try {
      const { wallet, connectorData } = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "dark",
        dappName: "LeftCurve",
        webWalletUrl: "https://web.argent.xyz",
      });

      if (wallet && connectorData?.account) {
        onStarknetConnect(wallet, connectorData.account);
        logPerf('Starknet Connection', performance.now() - startTime, 'Starknet');
        showToast('CONNECTED', 'success');
      }
    } catch {
      showToast('CONNECTION_ERROR', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePrivyConnect = async () => {
    if (!privyReady) return;
    
    setIsConnecting(true);
    showToast('EVM_CONNECTING', 'loading');
    
    await login();
    setIsConnecting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        {step === 'choose' && (
          <>
            <DialogHeader>
              <DialogTitle>Connect your Wallet</DialogTitle>
              <p className="text-sm text-muted-foreground mt-2">
                By connecting a wallet, you agree to LeftCurve Terms of Service and represent and warrant 
                that you are not a Restricted Person.
              </p>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button
                onClick={() => setStep('evm-terms')}
                className="w-full"
                variant="outline"
                disabled={!privyReady}
              >
                {!privyReady ? 'Loading...' : 'Choose EVM Wallet'}
              </Button>
              <Button
                onClick={handleStarknetConnect}
                className="w-full"
                variant="outline"
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Starknet Wallet'}
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
              <Button 
                onClick={handlePrivyConnect} 
                className="w-full"
                disabled={isConnecting || !privyReady}
              >
                {isConnecting ? 'Connecting...' : 'Continue'}
              </Button>
              <Button
                onClick={() => setStep('choose')}
                variant="outline"
                className="w-full"
                disabled={isConnecting}
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