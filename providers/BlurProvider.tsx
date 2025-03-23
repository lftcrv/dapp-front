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
import { useReferralCode } from '@/hooks/use-referal-code';

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

export function BlurProvider({ children }: { children: ReactNode }) {
  const [isBlurred, setIsBlurred] = useState(true);
  const [shouldShowReferralMessage, setShouldShowReferralMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { starknetWallet, privyAuthenticated } = useWallet();
  const { referralCode, isValidating } = useReferralCode();

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const isWalletConnected = starknetWallet.isConnected || privyAuthenticated;
    
    if (isWalletConnected) {
      if (referralCode) {
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
  }, [starknetWallet.isConnected, privyAuthenticated, referralCode]);

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