'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { DepositButton } from './deposit-button'
import { WalletButtonSkeleton } from './wallet-button-skeleton'
import { startTiming, endTiming } from '@/components/performance-monitor'
import dynamic from 'next/dynamic'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Create Agent', href: '/create-agent' },
  { name: 'Leaderboard', href: '/leaderboard' }
]

// Lazy load wallet button with better error handling
const WalletButtonContainer = dynamic(() => 
  import('./wallet-button')
    .then(mod => {
      const Component = mod.WalletButton as React.FC;
      Component.displayName = 'WalletButton';
      return Component;
    })
    .catch(err => {
      console.error('Failed to load wallet button:', err);
      const FallbackComponent: React.FC = () => <WalletButtonSkeleton />;
      FallbackComponent.displayName = 'WalletButtonFallback';
      return FallbackComponent;
    }),
  { 
    loading: () => {
      const LoadingComponent: React.FC = () => <WalletButtonSkeleton />;
      LoadingComponent.displayName = 'WalletButtonLoading';
      return <LoadingComponent />;
    },
    ssr: false 
  }
);

export function NavigationMenu() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      startTiming('NavigationMenu')
      return () => endTiming('NavigationMenu')
    }
  }, [])

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
                className="rounded-full w-8 h-8"
                priority={false} // Deprioritize logo loading
                unoptimized // Prevent Next.js image optimization for small images
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
            <React.Suspense fallback={<WalletButtonSkeleton />}>
              <WalletButtonContainer />
            </React.Suspense>
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
      {isOpen && (
        <div className="md:hidden">
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
              <React.Suspense fallback={<WalletButtonSkeleton />}>
                <WalletButtonContainer />
              </React.Suspense>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 