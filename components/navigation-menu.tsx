'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { shortAddress } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'My Agents', href: '/my-agents' },
  { name: 'Leaderboard', href: '/leaderboard' },
]

export function NavigationMenu() {
  const [isOpen, setIsOpen] = React.useState(false)
  const { address, isConnecting, walletType, connect, disconnect } = useWallet()

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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Image 
                src="/degen.png" 
                alt="Degen Logo" 
                width={48} 
                height={48} 
                className="h-14 w-auto"
              />
            </Link>
            <Link href="/" className="text-4xl font-sketch text-black hidden md:block">leftcurve</Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-black focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">
                {isOpen ? 'Close main menu' : 'Open main menu'}
              </span>
              <motion.svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={isOpen ? 'open' : 'closed'}
                variants={{
                  open: { rotate: 45 },
                  closed: { rotate: 0 },
                }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </motion.svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-white/95 backdrop-blur-sm border-b border-black/10"
          >
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navigation.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    className="block py-2 text-base font-medium text-gray-600 hover:text-black transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4">
                <WalletButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
} 