'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { shortAddress } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { DepositButton } from './deposit-button'
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
import { StarknetAccountDerivation } from './starknet-account-derivation'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Create Agent', href: '/create-agent' },
  { name: 'Leaderboard', href: '/leaderboard' }
]

interface StarknetWalletState {
  wallet: StarknetWindowObject | null;
  address?: string;
  isConnected: boolean;
}

export function NavigationMenu() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [showWalletModal, setShowWalletModal] = React.useState(false)
  const { ready, authenticated, logout } = usePrivy()
  const { address: evmAddress } = useAccount()
  const [starknetWallet, setStarknetWallet] = React.useState<StarknetWalletState>({
    wallet: null,
    isConnected: false
  })
  const pathname = usePathname()

  // Function to clear Starknet state
  const clearStarknetState = React.useCallback(() => {
    setStarknetWallet({
      wallet: null,
      isConnected: false
    });
    localStorage.removeItem('starknet_wallet');
  }, []);

  // Check for existing Starknet connection on mount
  React.useEffect(() => {
    const checkStarknetConnection = async () => {
      try {
        // Only check localStorage for existing connection
        const savedWallet = localStorage.getItem('starknet_wallet');
        if (savedWallet) {
          const { address, isConnected } = JSON.parse(savedWallet);
          if (isConnected) {
            // Try to reconnect silently
            const { wallet } = await connect({
              modalMode: "neverAsk",
              modalTheme: "dark",
              dappName: "LeftCurve",
            });
            
            if (wallet) {
              try {
                // Verify the connection is still valid
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
      }
    };

    // Only check Starknet if no EVM wallet is connected
    if (!authenticated) {
      checkStarknetConnection();
    }
  }, [authenticated, clearStarknetState]);

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

  const WalletButton = () => {
    // Show connected state for either Starknet or EVM wallet
    if (starknetWallet.isConnected || (authenticated && evmAddress)) {
      const address = starknetWallet.address || evmAddress || ''
      const walletType = starknetWallet.isConnected ? 'Starknet' : 'EVM'

      return (
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
      )
    }

    return (
      <Button
        onClick={() => setShowWalletModal(true)}
        disabled={!ready}
        className="bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:opacity-90"
      >
        {!ready ? 'Loading...' : 'Connect Wallet'}
      </Button>
    )
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/degen.png"
                alt="LeftCurve Logo"
                width={32} 
                height={32} 
                className="rounded-full"
              />
              <span className="font-sketch text-xl">LeftCurve</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors hover:text-primary ${
                  pathname === item.href 
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <DepositButton />
            <WalletButton />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/80 backdrop-blur-sm border-b border-white/5">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors hover:text-primary ${
                    pathname === item.href 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <DepositButton />
              </div>
              <div className="px-3 py-2">
                <WalletButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Connect Modal */}
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

      {/* Handle Starknet account derivation when connecting with EVM */}
      <StarknetAccountDerivation />
    </nav>
  )
} 