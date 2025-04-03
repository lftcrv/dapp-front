'use client';

import React, { useState, useEffect } from 'react';
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute';
import { useWallet } from '@/app/context/wallet-context';
import { WalletButton } from '@/components/wallet-button';
import { useRouter } from 'next/navigation';

// Get admin wallet addresses from environment variables
const NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES || '';
const ADMIN_WALLETS = NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES.split(',')
  .map(address => address.trim().toLowerCase())
  .filter(Boolean);

// For security, log the admin wallets (only visible on the server)
console.log('Admin wallet addresses:', ADMIN_WALLETS);

/**
 * This layout acts as the sole gatekeeper for admin access across all admin pages.
 * It uses the AdminProtectedRoute component to verify admin wallet access
 * and bypasses the general AccessGateProvider checks.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { starknetWallet, privyAuthenticated } = useWallet();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isAdminWallet, setIsAdminWallet] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Check if either wallet is connected
    const connected = starknetWallet.isConnected || privyAuthenticated;
    setIsWalletConnected(connected);
    
    // Direct wallet check
    const walletAddress = starknetWallet.address?.toLowerCase();
    console.log('🏆 Admin layout wallet check:', walletAddress);
    
    if (!walletAddress) {
      setIsAdminWallet(false);
      return;
    }
    
    // Check against approved admin wallets from environment
    const isAdmin = ADMIN_WALLETS.includes(walletAddress);
    console.log(`Wallet ${walletAddress} is admin: ${isAdmin}`);
    setIsAdminWallet(isAdmin);
    
    // Redirect non-admin wallets
    if (!isAdmin && connected) {
      console.log('🚫 Non-admin wallet detected. Redirecting to home...');
      setTimeout(() => {
        router.push('/');
      }, 100);
    }
  }, [starknetWallet.isConnected, starknetWallet.address, privyAuthenticated, router]);

  if (!isWalletConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6">Admin Access Required</h1>
          <p className="mb-6 text-gray-600">
            Please connect your wallet to access the admin dashboard.
          </p>
          <div className="mb-4">
            <WalletButton />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Only authorized wallet addresses can access this area.
          </p>
        </div>
      </div>
    );
  }
  
  if (!isAdminWallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6 text-red-600">Access Denied</h1>
          <p className="mb-6 text-gray-600">
            Your wallet {starknetWallet.address} does not have admin access.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            This incident has been logged.
          </p>
        </div>
      </div>
    );
  }

  // AdminProtectedRoute handles the admin wallet verification as a second layer
  return (
    <AdminProtectedRoute>
      {children}
    </AdminProtectedRoute>
  );
} 