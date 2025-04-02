'use client';

import { type ReactNode, useEffect, useState, useCallback } from 'react';
import { useWallet } from '@/app/context/wallet-context';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

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
const ADMIN_DIAGNOSTICS_PAGE = '/admin';

// Admin wallet addresses from environment variable
// This should be a comma-separated list of wallet addresses in the .env file
const ADMIN_WALLET_ADDRESSES = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES || '';
const adminWallets = ADMIN_WALLET_ADDRESSES.split(',').map(address => address.trim().toLowerCase());

export function CookieAuthManager({ children }: { children: ReactNode }) {
  const { starknetWallet, privyAuthenticated, hasValidReferral } = useWallet();
  const isConnected = starknetWallet.isConnected || privyAuthenticated;
  const walletAddress = starknetWallet.address || '';
  const pathname = usePathname();
  
  // Track previous connection state to detect connections
  const [prevConnected, setPrevConnected] = useState(false);
  const [prevAddress, setPrevAddress] = useState('');
  
  // Function to check if current wallet is an admin wallet
  const isAdminWallet = useCallback(() => {
    if (!walletAddress) return false;
    return adminWallets.includes(walletAddress.toLowerCase());
  }, [walletAddress]);
  
  // Function to check if current route is an admin route
  const isAdminRoute = useCallback(() => {
    if (!pathname) return false;
    
    // Skip routes that have their own protection
    const hasOwnProtection = ROUTES_WITH_OWN_PROTECTION.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    if (hasOwnProtection) {
      return false;
    }
    
    // Check if the current path starts with any of the admin routes
    return ADMIN_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
  }, [pathname]);
  
  // Function to check if current route is the main admin diagnostics page
  const isAdminDiagnosticsPage = useCallback(() => {
    return pathname === ADMIN_DIAGNOSTICS_PAGE;
  }, [pathname]);
  
  // Verify wallet has proper access for EVERY render
  useEffect(() => {
    // Skip verification for admin wallet - they have universal access
    if (isAdminWallet()) {
      console.log('CookieAuthManager: Admin wallet detected, skipping verification');
      return;
    }
    
    // For admin diagnostics page, allow access for any connected wallet
    if (isAdminDiagnosticsPage()) {
      console.log('CookieAuthManager: Admin diagnostics page, allowing access');
      return;
    }
    
    // For admin routes, don't manage cookies - let AccessGateProvider handle it
    if (isAdminRoute()) {
      console.log('CookieAuthManager: Admin route detected, special handling applies');
      return;
    }
    
    if (isConnected && walletAddress) {
      // Get wallet address from cookie
      const cookieWalletAddress = Cookies.get('wallet_address');
      
      // If cookies exist but wallet address doesn't match, clear them immediately
      if (cookieWalletAddress && cookieWalletAddress !== walletAddress) {
        console.log('Wallet switched, revoking access cookies');
        Cookies.remove('has_referral');
        Cookies.remove('has_access');
        
        // Clear the wallet address cookie
        Cookies.remove('wallet_address');
        
        // Don't reload to avoid loops, let other components handle UI updates
      }
      
      // Set wallet address in cookies if connected and not already set
      if (!cookieWalletAddress && walletAddress) {
        console.log('Setting wallet address in cookies');
        Cookies.set('wallet_address', walletAddress);
      }
    }
  }, [isConnected, walletAddress, isAdminRoute, isAdminWallet, isAdminDiagnosticsPage]);
  
  // Anti-loop protection for reload scenarios
  useEffect(() => {
    // Skip verification for admin wallets
    if (isAdminWallet()) {
      return;
    }
    
    // For admin diagnostics page, allow access
    if (isAdminDiagnosticsPage()) {
      return;
    }
    
    // For admin routes, handle differently
    if (isAdminRoute()) {
      return;
    }
    
    // Check if we've recently done a reload to prevent loops
    const recentReload = sessionStorage.getItem('recent_auth_reload');
    const reloadTimestamp = parseInt(recentReload || '0', 10);
    const now = Date.now();
    
    // If we reloaded within the last 2 seconds, don't reload again
    if (reloadTimestamp && now - reloadTimestamp < 2000) {
      console.log('Preventing reload loop, already reloaded recently');
      sessionStorage.removeItem('recent_auth_reload');
      return;
    }
    
    // Handle wallet switches that bypass the render loop check
    if (isConnected && walletAddress && prevAddress && prevAddress !== walletAddress) {
      console.log('Wallet changed between renders, validating authorization');
      
      // Get wallet address from cookie
      const cookieWalletAddress = Cookies.get('wallet_address');
      
      // If cookie wallet address doesn't match current wallet, clear cookies
      if (cookieWalletAddress && cookieWalletAddress !== walletAddress) {
        const hasCookieAccess = Cookies.get('has_referral') === 'true' || Cookies.get('has_access') === 'true';
        
        if (hasCookieAccess) {
          console.log('Connected wallet changed but access cookies exist, clearing and reloading');
          Cookies.remove('has_referral');
          Cookies.remove('has_access');
          Cookies.remove('wallet_address');
          
          // Set reload marker with timestamp to prevent loops
          sessionStorage.setItem('recent_auth_reload', now.toString());
          
          // Reload once to update state
          window.location.reload();
        }
      }
    }
    
    // Handle disconnection
    if (prevConnected && !isConnected) {
      console.log('Wallet disconnected, clearing all cookies');
      Cookies.remove('has_referral');
      Cookies.remove('has_access');
      Cookies.remove('wallet_address');
    }
    
    // Update previous state for next render
    setPrevConnected(isConnected);
    if (walletAddress) {
      setPrevAddress(walletAddress);
    }
  }, [isConnected, walletAddress, prevConnected, prevAddress, isAdminRoute, isAdminWallet, isAdminDiagnosticsPage]);
  
  // When a wallet with access is verified, update all cookie data
  useEffect(() => {
    // Skip verification for admin wallets or admin routes
    if (isAdminWallet() || isAdminRoute() || isAdminDiagnosticsPage()) {
      return;
    }
    
    if (isConnected && hasValidReferral && walletAddress) {
      console.log('Wallet has validated access, updating cookies');
      localStorage.setItem('access_authorized_address', walletAddress);
      
      // Ensure wallet address is stored in cookies
      Cookies.set('wallet_address', walletAddress);
    }
  }, [isConnected, hasValidReferral, walletAddress, isAdminRoute, isAdminWallet, isAdminDiagnosticsPage]);
  
  return <>{children}</>;
} 