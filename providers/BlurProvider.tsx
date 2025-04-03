'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useWallet } from '@/app/context/wallet-context';
import { useReferralCode } from '@/hooks/use-referral-code';
import { usePathname } from 'next/navigation';

interface BlurContextType {
  isBlurred: boolean;
  shouldShowReferralMessage: boolean;
  referralCode: string | null;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  resetError: () => void;
}

const BlurContext = createContext<BlurContextType | undefined>(undefined);

// Routes that should be exempt from blur/referral requirements
const EXEMPT_ROUTES = [
  '/admin', // Main admin page and all sub-routes
];

export function BlurProvider({ children }: { children: ReactNode }) {
  const [isBlurred, setIsBlurred] = useState(true);
  const [shouldShowReferralMessage, setShouldShowReferralMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { starknetWallet, privyAuthenticated, hasValidReferral } = useWallet();
  const { referralCode, isValidating } = useReferralCode();
  const pathname = usePathname();

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Check if current route is exempt from blur/referral requirements
  const isExemptRoute = useCallback(() => {
    if (!pathname) return false;
    
    return EXEMPT_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
  }, [pathname]);

  useEffect(() => {
    // If this is an admin route, never blur
    if (isExemptRoute()) {
      console.log(`Route ${pathname} is exempt from blur requirements, not showing blur/referral`);
      setIsBlurred(false);
      setShouldShowReferralMessage(false);
      return;
    }

    const isWalletConnected = starknetWallet.isConnected || privyAuthenticated;
    
    // If the wallet is connected and has valid referral or referral code exists,
    // unblur the app. Otherwise, show the referral message.
    if (isWalletConnected) {
      if (hasValidReferral || referralCode) {
        setIsBlurred(false);
        setShouldShowReferralMessage(false);
      } else {
        setIsBlurred(true);
        setShouldShowReferralMessage(true);
      }
    } else {
      setIsBlurred(true);
      setShouldShowReferralMessage(false);
    }
  }, [starknetWallet.isConnected, privyAuthenticated, hasValidReferral, referralCode, pathname, isExemptRoute]);

  const contextValue = {
    isBlurred,
    shouldShowReferralMessage,
    referralCode,
    isLoading,
    isValidating,
    error,
    resetError
  };

  return (
    <BlurContext.Provider value={contextValue}>
      {children}
    </BlurContext.Provider>
  );
}

export function useBlur() {
  const context = useContext(BlurContext);
  if (context === undefined) {
    throw new Error('useBlur must be used within a BlurProvider');
  }
  return context;
}