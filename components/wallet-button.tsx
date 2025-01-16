'use client'

import * as React from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { shortAddress } from '@/lib/utils'
import { WalletConnectModal } from './wallet-connect-modal'
import { Wallet2, LogOut, Copy } from 'lucide-react'
import { connect, disconnect } from 'starknetkit'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { showToast } from '@/components/ui/custom-toast'
import { type StarknetWindowObject } from 'get-starknet-core'

interface StarknetWalletState {
  wallet: StarknetWindowObject | null;
  address?: string;
  isConnected: boolean;
}

export function WalletButton() {
  const [showWalletModal, setShowWalletModal] = React.useState(false)
  const { ready, authenticated, logout } = usePrivy()
  const { address: evmAddress } = useAccount()
  const [starknetWallet, setStarknetWallet] = React.useState<StarknetWalletState>({
    wallet: null,
    isConnected: false
  })
  const [isLoadingWallet, setIsLoadingWallet] = React.useState(false)

  // Function to clear Starknet state
  const clearStarknetState = React.useCallback(() => {
    setStarknetWallet({
      wallet: null,
      isConnected: false
    });
    localStorage.removeItem('starknet_wallet');
  }, []);

  // Lazy load Starknet connection check
  const checkStarknetConnection = React.useCallback(async () => {
    if (isLoadingWallet || authenticated) return;
    
    setIsLoadingWallet(true);
    try {
      const savedWallet = localStorage.getItem('starknet_wallet');
      if (savedWallet) {
        const { address, isConnected } = JSON.parse(savedWallet);
        if (isConnected) {
          const { wallet } = await connect({
            modalMode: "neverAsk",
            modalTheme: "dark",
            dappName: "LeftCurve",
          });
          
          if (wallet) {
            try {
              const [currentAddress] = await wallet.request({
                type: 'wallet_requestAccounts'
              });
              
              if (currentAddress === address) {
                setStarknetWallet({
                  wallet,
                  address: currentAddress,
                  isConnected: true
                });
              } else {
                clearStarknetState();
              }
            } catch {
              clearStarknetState();
            }
          } else {
            clearStarknetState();
          }
        }
      }
    } catch (err) {
      console.error('Failed to check Starknet connection:', err);
      clearStarknetState();
    } finally {
      setIsLoadingWallet(false);
    }
  }, [authenticated, clearStarknetState, isLoadingWallet]);

  // Only check Starknet connection when user interacts with wallet button
  const handleWalletClick = () => {
    if (!ready) return;
    if (!authenticated && !starknetWallet.isConnected) {
      checkStarknetConnection();
    }
    setShowWalletModal(true);
  };

  // Handle EVM wallet changes
  React.useEffect(() => {
    if (authenticated && starknetWallet.isConnected) {
      clearStarknetState();
    }
  }, [authenticated, starknetWallet.isConnected, clearStarknetState]);

  const handleDisconnect = async () => {
    try {
      // Handle EVM wallet disconnection first
      if (authenticated) {
        await logout();
        clearStarknetState();
        showToast('info', '👋 GM -> GN', {
          description: '🌙 EVM wallet disconnected... See you soon!'
        });
        return; // Exit early after EVM disconnect
      }

      // Handle Starknet wallet disconnection
      if (starknetWallet.isConnected && starknetWallet.wallet) {
        try {
          // First try to disconnect using StarknetKit
          await disconnect();
        } catch {
          // Ignore error, we'll clear state anyway
        }
        
        clearStarknetState();
        showToast('info', '👋 GM -> GN', {
          description: '🌙 Starknet wallet disconnected... See you soon!'
        });
      }
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      showToast('error', '😭 NGMI...', {
        description: '↘️ Failed to disconnect. Try again ser! 📉'
      });
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  // Show connected state for either Starknet or EVM wallet
  if (starknetWallet.isConnected || (authenticated && evmAddress)) {
    const address = starknetWallet.address || evmAddress || ''
    const walletType = starknetWallet.isConnected ? 'Starknet' : 'EVM'

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="font-mono text-sm"
            >
              {starknetWallet.isConnected ? '🌟' : '⚡️'} {shortAddress(address)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="flex flex-col px-2 py-1.5 gap-1">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Wallet2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Connected {walletType} Wallet</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50">
                <span className="font-mono text-sm">{shortAddress(address)}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-auto hover:bg-muted"
                  onClick={() => handleCopyAddress(address)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDisconnect}
              className="px-2 py-1.5 text-sm font-medium text-red-500 focus:text-red-500 focus:bg-red-500/10 data-[highlighted]:text-red-500 data-[highlighted]:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <WalletConnectModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onStarknetConnect={(wallet: StarknetWindowObject, address: string) => {
            setStarknetWallet({
              wallet,
              address,
              isConnected: true
            });
          }}
        />
      </>
    )
  }

  return (
    <>
      <Button
        onClick={handleWalletClick}
        disabled={!ready || isLoadingWallet}
        className="bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:opacity-90 min-w-[140px] transition-all"
      >
        {!ready || isLoadingWallet ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : (
          <>
            <Wallet2 className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>

      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onStarknetConnect={(wallet: StarknetWindowObject, address: string) => {
          setStarknetWallet({
            wallet,
            address,
            isConnected: true
          });
        }}
      />
    </>
  )
} 