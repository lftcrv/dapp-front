'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { shortAddress } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { DepositButton } from './deposit-button'
import { WalletConnectModal } from './wallet-connect-modal'
import { usePrivy } from '@privy-io/react-auth'
import { useUserSync } from '@/hooks/use-user-sync'
import { Wallet2, LogOut, Copy } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Create Agent', href: '/create-agent' },
  { name: 'Leaderboard', href: '/leaderboard' }
]

export function NavigationMenu() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [showWalletModal, setShowWalletModal] = React.useState(false)
  const { address: starknetAddress, isConnecting: isStarknetConnecting, disconnect: disconnectStarknet } = useWallet()
  const { ready: privyReady, user, logout: disconnectEVM } = usePrivy()
  const pathname = usePathname()
  const [linkedStarknetAddress, setLinkedStarknetAddress] = React.useState<string>()

  const evmAddress = user?.wallet?.address
  
  // Use the useUserSync hook to handle user creation/updates
  useUserSync()

  // Fetch linked Starknet address when EVM wallet is connected
  React.useEffect(() => {
    const fetchLinkedAddress = async () => {
      if (evmAddress) {
        try {
          console.log('Fetching user data for EVM address:', evmAddress);
          const response = await fetch(`/api/users?address=${evmAddress}`);
          if (response.ok) {
            const userData = await response.json();
            console.log('Fetched user data:', userData);
            if (userData.starknetAddress || userData.privateKey) {
              setLinkedStarknetAddress(userData.starknetAddress || userData.privateKey);
            } else {
              console.log('No Starknet address found for user');
              setLinkedStarknetAddress(undefined);
            }
          } else {
            console.log('Failed to fetch user data:', await response.text());
            setLinkedStarknetAddress(undefined);
          }
        } catch (error) {
          console.error('Error fetching linked address:', error);
          setLinkedStarknetAddress(undefined);
        }
      } else {
        setLinkedStarknetAddress(undefined);
      }
    };
    fetchLinkedAddress();
  }, [evmAddress]);

  const handleDisconnect = async () => {
    if (starknetAddress) {
      await disconnectStarknet()
    } else if (evmAddress) {
      await disconnectEVM()
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  const WalletButton = () => {
    if (starknetAddress) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="font-mono text-sm"
            >
              🌟 {shortAddress(starknetAddress)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="flex flex-col px-2 py-1.5 gap-1">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Wallet2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Connected with Starknet</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50">
                <span className="font-mono text-sm">{shortAddress(starknetAddress)}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-auto hover:bg-muted"
                  onClick={() => handleCopyAddress(starknetAddress)}
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

    if (evmAddress && privyReady) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="font-mono text-sm"
            >
              ⚡️ {shortAddress(evmAddress)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="flex flex-col px-2 py-1.5 gap-1">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Wallet2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Connected with EVM Wallet</span>
              </div>
              {linkedStarknetAddress && (
                <>
                  <div className="flex items-center gap-2 px-2 py-1.5 mt-2">
                    <Wallet2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">LeftCurve Generated Wallet</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50">
                    <span className="font-mono text-sm">{shortAddress(linkedStarknetAddress)}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 ml-auto hover:bg-muted"
                      onClick={() => handleCopyAddress(linkedStarknetAddress)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
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
        disabled={isStarknetConnecting || !privyReady}
        className="bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:opacity-90"
      >
        {isStarknetConnecting ? 'Connecting...' : 'Connect Wallet'}
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
            <div className="space-y-1 px-4 pb-3 pt-2 bg-background/80 backdrop-blur-sm border-t border-white/5">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block py-2 text-base transition-colors hover:text-primary ${
                    pathname === item.href 
                      ? 'text-primary font-medium' 
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2">
                <DepositButton />
              </div>
              <div className="pt-2">
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
      />
    </nav>
  )
} 