'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useWallet } from '@/app/context/wallet-context';
import Cookies from 'js-cookie';

export function CookieAuthManager({ children }: { children: ReactNode }) {
  const { starknetWallet, privyAuthenticated, hasValidReferral } = useWallet();
  const isConnected = starknetWallet.isConnected || privyAuthenticated;
  const walletAddress = starknetWallet.address || '';
  
  // Track previous connection state to detect connections
  const [prevConnected, setPrevConnected] = useState(false);
  const [prevAddress, setPrevAddress] = useState('');
  
  // Verify wallet has proper access for EVERY render
  useEffect(() => {
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
  }, [isConnected, walletAddress]);
  
  // Anti-loop protection for reload scenarios
  useEffect(() => {
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
  }, [isConnected, walletAddress, prevConnected, prevAddress]);
  
  // When a wallet with access is verified, update all cookie data
  useEffect(() => {
    if (isConnected && hasValidReferral && walletAddress) {
      console.log('Wallet has validated access, updating cookies');
      localStorage.setItem('access_authorized_address', walletAddress);
      
      // Ensure wallet address is stored in cookies
      Cookies.set('wallet_address', walletAddress);
    }
  }, [isConnected, hasValidReferral, walletAddress]);
  
  return <>{children}</>;
} 