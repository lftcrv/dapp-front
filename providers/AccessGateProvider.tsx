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
import { useSearchParams, usePathname } from 'next/navigation';
import Cookies from 'js-cookie'; // Client-side cookie library

interface AccessGateContextType {
  showAccessModal: boolean;
  setShowAccessModal: (show: boolean) => void; // Allow manual control if needed
}

const AccessGateContext = createContext<AccessGateContextType | undefined>(
  undefined,
);

// Routes that should only be accessible to admin wallets - MOVED ALL TO OWN PROTECTION
const ADMIN_ROUTES: string[] = [
  // EMPTY - All admin routes now use their own protection
];

// Routes that should be exempt from access gate protection (handled by their own layout components)
const EXEMPT_ROUTES: string[] = [
  '/admin', // Main admin page and all its sub-routes
];

// Main admin page - no longer used for diagnostics, fully protected by its layout
const ADMIN_DIAGNOSTICS_PAGE = '';

// Admin wallet addresses from environment variable
// This should be a comma-separated list of wallet addresses in the .env file
const ADMIN_WALLET_ADDRESSES = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES || '';
const adminWallets = ADMIN_WALLET_ADDRESSES.split(',').map(address => address.trim().toLowerCase());

export function AccessGateProvider({ children }: { children: ReactNode }) {
  const [showAccessModal, setShowAccessModal] = useState(false);
  const { starknetWallet, privyAuthenticated, hasValidReferral } = useWallet();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [lastCheckedAddress, setLastCheckedAddress] = useState<string | null>(null);
  const walletAddress = starknetWallet.address || '';
  const isConnected = starknetWallet.isConnected || privyAuthenticated;

  // Function to check if current wallet is an admin wallet
  const isAdminWallet = useCallback(() => {
    if (!walletAddress) return false;
    
    const isAdmin = adminWallets.includes(walletAddress.toLowerCase());
    console.log(`Checking if wallet ${walletAddress} is admin:`, isAdmin);
    console.log('Admin wallets:', adminWallets);
    return isAdmin;
  }, [walletAddress]);

  // Function to check if current route is exempt from access gate protection
  const isExemptRoute = useCallback(() => {
    if (!pathname) return false;
    
    // Check if the current path starts with any of the exempt routes
    return EXEMPT_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
  }, [pathname]);

  // Function to check if current route is an admin route
  const isAdminRoute = useCallback(() => {
    if (!pathname) return false;
    
    // All admin routes are now exempt and handle their own protection
    return false;
  }, [pathname]);

  // Function to check if current route is the main admin diagnostics page
  const isAdminDiagnosticsPage = useCallback(() => {
    // No longer using the diagnostics concept - fully protected by layout
    return false;
  }, [pathname]);

  // Function to verify access against the wallet cookie
  const verifyAccessValidity = useCallback(() => {
    // Skip checks if not connected
    if (!isConnected || !walletAddress) {
      return false;
    }
    
    // If this is an admin wallet, grant access to all routes
    if (isAdminWallet()) {
      console.log('Admin wallet detected, granting full access');
      return true;
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
  }, [isConnected, walletAddress, isAdminWallet]);

  // Check access on every relevant change
  useEffect(() => {
    // Skip the access check for exempt routes (including all admin routes)
    if (isExemptRoute()) {
      console.log(`Route ${pathname} is exempt from access gate, not showing modal`);
      setShowAccessModal(false);
      return;
    }
    
    // Skip the access check if a reload is pending
    const recentReload = sessionStorage.getItem('recent_auth_reload');
    if (recentReload) {
      console.log('AccessGateProvider: Skipping check due to recent reload');
      return;
    }
    
    // For non-admin routes, check regular access
    const checkRegularAccess = () => {
      // Track current wallet address for change detection
      if (isConnected && walletAddress && lastCheckedAddress !== walletAddress) {
        console.log(`Address changed from ${lastCheckedAddress || 'none'} to ${walletAddress}`);
        setLastCheckedAddress(walletAddress);
      }
      
      // Check referral status
      const hasWalletAccess = hasValidReferral;
      const hasReferralParam = searchParams.has('ref');
      
      // Verify cookie-based access
      const hasCookieAccess = verifyAccessValidity();
      
      console.log('Regular route access check:', { hasCookieAccess, hasWalletAccess, hasReferralParam });
      
      // Access is granted if cookies are valid OR wallet has referral
      const accessGranted = hasCookieAccess || (isConnected && hasWalletAccess);
      
      // Show modal if connected, no access, and no ref param
      const shouldShow = isConnected && !accessGranted && !hasReferralParam;
      
      console.log('Should show modal:', shouldShow);
      setShowAccessModal(shouldShow);
    };

    checkRegularAccess();
  }, [
    starknetWallet.isConnected,
    starknetWallet.address,
    privyAuthenticated,
    hasValidReferral,
    searchParams,
    verifyAccessValidity,
    isConnected,
    walletAddress,
    lastCheckedAddress,
    isExemptRoute,
    pathname
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