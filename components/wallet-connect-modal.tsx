'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { connect } from 'starknetkit';
import { useState, useEffect } from 'react';
import { showToast } from './ui/custom-toast';
import { type StarknetWindowObject } from 'get-starknet-core';

export function WalletConnectModal({
  isOpen,
  onClose,
  onStarknetConnect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStarknetConnect: (wallet: StarknetWindowObject, address: string) => void;
}) {
  const [step, setStep] = useState<'choose' | 'evm-terms'>('choose');
  const { login, ready: privyReady, authenticated, logout } = usePrivy();
  const [isConnecting, setIsConnecting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('choose');
    }
  }, [isOpen]);

  const handleEVMConnect = async () => {
    try {
      await login();
      onClose();
    } catch (error) {
      console.error('Failed to connect EVM wallet:', error);
    }
  };

  const handleStarknetConnect = async () => {
    try {
      setIsConnecting(true);
      onClose();

      // If Privy is authenticated, logout first to avoid conflicts
      if (privyReady && authenticated) {
        await logout();
        // Small delay to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Connect to Starknet using StarknetKit
      const { wallet } = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "dark",
        dappName: "LeftCurve",
        webWalletUrl: "https://web.argent.xyz",
      });

      if (wallet) {
        // Request account access
        const [address] = await wallet.request({
          type: 'wallet_requestAccounts'
        });

        // Store connection in localStorage to persist across refreshes
        localStorage.setItem('starknet_wallet', JSON.stringify({
          address,
          isConnected: true
        }));

        // Update parent state immediately
        onStarknetConnect(wallet, address);

        showToast('success', '🧠 WAGMI FRENS!', {
          description: `↗️ Your Starknet wallet is now connected! 📈`
        });
      }
    } catch (error) {
      if (error instanceof Error && !error.message.includes('User rejected')) {
        console.error('Failed to connect Starknet wallet:', error);
        showToast('error', '😭 NGMI...', {
          description: '↘️ MidCurver moment... Failed to connect. Try again ser! 📉'
        });
      }
    } finally {
      setIsConnecting(false);
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
                By connecting a wallet, you agree to LeftCurve Terms of Service and represent and warrant 
                that you are not a Restricted Person.
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
              <p className="text-sm text-muted-foreground mt-2">
                By connecting a wallet, you agree to LeftCurve Terms of Service and represent and warrant 
                that you are not a Restricted Person.
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