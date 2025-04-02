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
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie'; // Client-side cookie library

interface AccessGateContextType {
  showAccessModal: boolean;
  setShowAccessModal: (show: boolean) => void; // Allow manual control if needed
}

const AccessGateContext = createContext<AccessGateContextType | undefined>(
  undefined,
);

export function AccessGateProvider({ children }: { children: ReactNode }) {
  const [showAccessModal, setShowAccessModal] = useState(false);
  const { starknetWallet, privyAuthenticated, hasValidReferral } = useWallet();
  const searchParams = useSearchParams();
  const [lastCheckedAddress, setLastCheckedAddress] = useState<string | null>(null);
  const walletAddress = starknetWallet.address || '';
  const isConnected = starknetWallet.isConnected || privyAuthenticated;

  // Function to verify access against the wallet cookie
  const verifyAccessValidity = useCallback(() => {
    // Skip checks if not connected
    if (!isConnected || !walletAddress) {
      return false;
    }
    
    // Check both the cookie wallet address and the localStorage authorized address
    const cookieWalletAddress = Cookies.get('wallet_address');
    const authorizedAddress = localStorage.getItem('access_authorized_address');
    
    // Access is valid if:
    // 1. Cookie wallet address exists and matches current wallet AND
    // 2. Access cookies exist
    const hasCookieAccess = Cookies.get('has_referral') === 'true' || Cookies.get('has_access') === 'true';
    
    // If no cookie wallet address, or doesn't match current wallet, access is invalid
    if (!cookieWalletAddress || cookieWalletAddress !== walletAddress) {
      return false;
    }
    
    // If authorized address exists and matches current wallet, and cookies exist, access is valid
    if (authorizedAddress && authorizedAddress === walletAddress && hasCookieAccess) {
      return true;
    }
    
    // If wallet has access cookies but no authorized address, verify the cookie wallet matches
    if (!authorizedAddress && hasCookieAccess && cookieWalletAddress === walletAddress) {
      return true;
    }
    
    return false;
  }, [isConnected, walletAddress]);

  // Check access on every relevant change
  useEffect(() => {
    // Skip the access check if a reload is pending
    const recentReload = sessionStorage.getItem('recent_auth_reload');
    if (recentReload) {
      console.log('AccessGateProvider: Skipping check due to recent reload');
      return;
    }
    
    const checkAccess = () => {
      // Track current wallet address for change detection
      if (isConnected && walletAddress && lastCheckedAddress !== walletAddress) {
        console.log(`Address changed from ${lastCheckedAddress || 'none'} to ${walletAddress}`);
        setLastCheckedAddress(walletAddress);
      }
      
      const hasWalletAccess = hasValidReferral;
      const hasReferralParam = searchParams.has('ref');
      
      // Verify cookie-based access
      const hasCookieAccess = verifyAccessValidity();
      
      // Access is granted if cookies are valid OR wallet has referral
      const accessGranted = hasCookieAccess || (isConnected && hasWalletAccess);
      
      // Show modal if connected, no access, and no ref param
      const shouldShow = isConnected && !accessGranted && !hasReferralParam;
      
      setShowAccessModal(shouldShow);
    };

    checkAccess();
  }, [
    starknetWallet.isConnected,
    starknetWallet.address,
    privyAuthenticated,
    hasValidReferral,
    searchParams,
    verifyAccessValidity,
    isConnected,
    walletAddress,
    lastCheckedAddress
  ]);

  const contextValue = {
    showAccessModal,
    setShowAccessModal,
  };

  return (
    <AccessGateContext.Provider value={contextValue}>
      {children}
    </AccessGateContext.Provider>
  );
}

export function useAccessGate() {
  const context = useContext(AccessGateContext);
  if (context === undefined) {
    throw new Error('useAccessGate must be used within an AccessGateProvider');
  }
  return context;
} 