'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { shortAddress } from '@/lib/utils'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Create Agent', href: '/create-agent' },
  { name: 'Leaderboard', href: '/leaderboard' },
]

export function NavigationMenu() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { address, isConnecting, walletType, connect, disconnect } = useWallet()
  const pathname = usePathname()

  const WalletButton = () => (
    address ? (
      <Button
        variant="outline"
        onClick={disconnect}
        className="font-mono text-sm"
      >
        {walletType === 'braavos' ? '🦧' : '🔵'} {shortAddress(address)}
      </Button>
    ) : (
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:opacity-90"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    )
  )

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
                  className={`block px-3 py-2 rounded-md text-base ${
                    pathname === item.href 
                      ? 'text-primary font-medium bg-primary/5' 
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <WalletButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
} 