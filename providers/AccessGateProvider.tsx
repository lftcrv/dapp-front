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

// Routes that already have their own admin protection and should be ignored
const ROUTES_WITH_OWN_PROTECTION: string[] = [
  '/admin', // Main admin page
  '/admin/access-codes', // Uses AdminProtectedRoute component
  '/admin/users',    // Admin users page
  '/admin/codes',    // Admin codes management
  '/admin/dashboard', // Admin dashboard
  '/admin/debug'     // Debug page
];

// Main admin page - allowed for viewing by any wallet for diagnostic purposes
// but requires admin wallet for actual admin functionality
const ADMIN_DIAGNOSTICS_PAGE = '/admin';

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

  // Function to check if current route is an admin route
  const isAdminRoute = useCallback(() => {
    if (!pathname) return false;
    
    // Skip routes that have their own protection
    const hasOwnProtection = ROUTES_WITH_OWN_PROTECTION.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    if (hasOwnProtection) {
      console.log(`Route ${pathname} has its own protection, skipping access check`);
      return false;
    }
    
    // Check if the current path starts with any of the admin routes
    const isAdmin = ADMIN_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    console.log(`Current path ${pathname} is admin route:`, isAdmin);
    return isAdmin;
  }, [pathname]);

  // Function to check if current route is the main admin diagnostics page
  const isAdminDiagnosticsPage = useCallback(() => {
    return pathname === ADMIN_DIAGNOSTICS_PAGE;
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
    // Skip the access check if a reload is pending
    const recentReload = sessionStorage.getItem('recent_auth_reload');
    if (recentReload) {
      console.log('AccessGateProvider: Skipping check due to recent reload');
      return;
    }
    
    // Special handling for the main admin diagnostics page
    if (isAdminDiagnosticsPage()) {
      console.log('Main admin diagnostics page detected');
      
      // Allow access to the admin diagnostics page for any connected wallet
      // This page will show wallet info and admin status for debugging purposes
      if (!isConnected) {
        // Not connected yet, show modal so they can connect
        console.log('User not connected on admin diagnostics page, showing modal to connect');
        setShowAccessModal(true);
      } else {
        // User is connected, allow access to the diagnostics page
        console.log('User connected on admin diagnostics page, allowing access');
        setShowAccessModal(false);
      }
      return;
    }
    
    // Handle admin routes specifically - only admin wallets can access
    if (isAdminRoute()) {
      const isAdmin = isAdminWallet();
      console.log(`Admin route access check - wallet is admin: ${isAdmin}, connected: ${isConnected}`);
      
      // For admin routes, show the modal if:
      // 1. The user is connected, AND
      // 2. The connected wallet is NOT an admin wallet
      if (isConnected && !isAdmin) {
        console.log('Non-admin wallet attempting to access admin route, showing modal');
        setShowAccessModal(true);
        return;
      } else if (!isConnected) {
        // Not connected yet, show modal so they can connect
        console.log('User not connected on admin route, showing modal to connect');
        setShowAccessModal(true);
        return;
      } else {
        // Admin wallet on admin route - don't show modal
        console.log('Admin wallet on admin route, not showing modal');
        setShowAccessModal(false);
        return;
      }
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
    isAdminRoute,
    isAdminWallet,
    isAdminDiagnosticsPage
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