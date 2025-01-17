'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { DepositButton } from './deposit-button'
import { WalletButtonSkeleton } from './wallet-button-skeleton'
import { startTiming, endTiming } from '@/components/performance-monitor'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { memo } from 'react'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Create Agent', href: '/create-agent' },
  { name: 'Leaderboard', href: '/leaderboard' }
] as const

const WalletButtonContainer = dynamic(() => 
  import('./wallet-button')
    .then(mod => {
      const Component = mod.WalletButton as React.FC
      Component.displayName = 'WalletButton'
      return Component
    })
    .catch(err => {
      console.error('Failed to load wallet button:', err)
      const FallbackComponent: React.FC = () => <WalletButtonSkeleton />
      FallbackComponent.displayName = 'WalletButtonFallback'
      return FallbackComponent
    }),
  { 
    loading: () => {
      const LoadingComponent: React.FC = () => <WalletButtonSkeleton />
      LoadingComponent.displayName = 'WalletButtonLoading'
      return <LoadingComponent />
    },
    ssr: false 
  }
)

const Logo = memo(() => (
  <Link href="/" className="flex items-center space-x-2">
    <Image 
      src="/degen.png"
      alt="LeftCurve Logo"
      width={32} 
      height={32}
      className="rounded-full w-8 h-8"
      priority={false}
      unoptimized
    />
    <span className="font-sketch text-xl">LeftCurve</span>
  </Link>
))
Logo.displayName = 'Logo'

const NavLink = memo(({ href, isActive, children }: { href: string, isActive: boolean, children: React.ReactNode }) => (
  <Link
    href={href}
    className={`text-sm transition-colors hover:text-primary relative ${
      isActive ? 'text-primary font-medium' : 'text-muted-foreground'
    }`}
  >
    {children}
    {isActive && (
      <motion.div
        layoutId="activeIndicator"
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
        initial={false}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    )}
  </Link>
))
NavLink.displayName = 'NavLink'

const MobileMenuButton = memo(({ isOpen, onClick }: { isOpen: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md p-2"
    aria-expanded={isOpen}
    aria-controls="mobile-menu"
    aria-label="Main menu"
  >
    <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
    <motion.div
      animate={isOpen ? "open" : "closed"}
      variants={{
        open: { rotate: 45 },
        closed: { rotate: 0 }
      }}
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </motion.div>
  </button>
))
MobileMenuButton.displayName = 'MobileMenuButton'

export const NavigationMenu = memo(() => {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      startTiming('NavigationMenu')
      return () => endTiming('NavigationMenu')
    }
  }, [])

  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <NavLink 
                key={item.href}
                href={item.href}
                isActive={pathname === item.href}
              >
                {item.name}
              </NavLink>
            ))}
            <DepositButton />
            <React.Suspense fallback={<WalletButtonSkeleton />}>
              <WalletButtonContainer />
            </React.Suspense>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <MobileMenuButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div 
              id="mobile-menu"
              className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/80 backdrop-blur-sm border-b border-white/5"
            >
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  isActive={pathname === item.href}
                >
                  {item.name}
                </NavLink>
              ))}
              <div className="px-3 py-2">
                <DepositButton />
              </div>
              <div className="px-3 py-2">
                <React.Suspense fallback={<WalletButtonSkeleton />}>
                  <WalletButtonContainer />
                </React.Suspense>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
})
NavigationMenu.displayName = 'NavigationMenu' 