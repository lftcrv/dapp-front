'use client';

import {
  useState,
  useEffect,
  useCallback,
  Suspense,
  type ReactNode,
  type MouseEvent,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { DepositButton } from './deposit-button';
import { WalletButtonSkeleton } from './wallet-button-skeleton';
import {
  startTiming,
  endTiming,
  startRouteTransition,
  endRouteTransition,
} from '@/lib/utils/performance';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';

const navigation = [
  {
    name: 'Home',
    href: '/',
    segment: null,
  },
  {
    name: 'Create Agent',
    href: '/create-agent',
    segment: 'create-agent',
  },
  {
    name: 'Leaderboard',
    href: '/leaderboard',
    segment: 'leaderboard',
  },
] as const;

// // Development-only performance tracking
// const usePerformanceTracking = (name: string) => {
//   useEffect(() => {
//     if (process.env.NODE_ENV === 'development') {
//       startTiming(`${name} Render`);
//       return () => endTiming(`${name} Render`);
//     }
//   }, [name]);
// };

// Optimized dynamic import with better error boundary
const WalletButtonContainer = dynamic(
  () => import('./wallet-button').then((mod) => mod.WalletButton),
  {
    loading: () => <WalletButtonSkeleton />,
    ssr: false,
  },
);

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
));
Logo.displayName = 'Logo';

const NavLink = memo(
  ({
    href,
    isActive,
    children,
  }: {
    href: string;
    isActive: boolean;
    children: ReactNode;
  }) => {
    const router = useRouter();

    const handleClick = useCallback(
      (e: MouseEvent) => {
        e.preventDefault();
        startRouteTransition();
        // Use replace for same-segment navigation to avoid history stack
        const isSameSegment =
          href.split('/')[1] === window.location.pathname.split('/')[1];
        router[isSameSegment ? 'replace' : 'push'](href);
      },
      [router, href],
    );

    return (
      <Link
        href={href}
        onClick={handleClick}
        prefetch={true}
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
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 30,
              duration: 0.2,
            }}
            onAnimationComplete={() => {
              if (isActive) {
                endRouteTransition();
              }
            }}
          />
        )}
      </Link>
    );
  },
);
NavLink.displayName = 'NavLink';

const MobileMenuButton = memo(
  ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md p-2"
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      aria-label="Main menu"
    >
      <span className="sr-only">
        {isOpen ? 'Close main menu' : 'Open main menu'}
      </span>
      <motion.div
        animate={isOpen ? 'open' : 'closed'}
        variants={{
          open: { rotate: 45 },
          closed: { rotate: 0 },
        }}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </motion.div>
    </button>
  ),
);
MobileMenuButton.displayName = 'MobileMenuButton';

export const NavigationMenu = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Development-only performance tracking
  // usePerformanceTracking('NavigationMenu');

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

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
            <Suspense fallback={null}>
              <DepositButton />
            </Suspense>
            <Suspense fallback={<WalletButtonSkeleton />}>
              <WalletButtonContainer />
            </Suspense>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <MobileMenuButton
              isOpen={isOpen}
              onClick={() => setIsOpen(!isOpen)}
            />
          </div>
        </div>
      </div>

      {/* Mobile menu with optimized animation */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/80 backdrop-blur-sm border-b border-white/5">
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
                <Suspense fallback={null}>
                  <DepositButton />
                </Suspense>
              </div>
              <div className="px-3 py-2">
                <Suspense fallback={<WalletButtonSkeleton />}>
                  <WalletButtonContainer />
                </Suspense>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
});
NavigationMenu.displayName = 'NavigationMenu';
