'use client';

import React, { useState, useEffect } from 'react';
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute';
import { useWallet } from '@/app/context/wallet-context';
import { WalletButton } from '@/components/wallet-button';

// Admin wallet addresses from environment variable
const ADMIN_WALLET_ADDRESSES = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES || '';
const adminWallets = ADMIN_WALLET_ADDRESSES.split(',').map(address => address.trim().toLowerCase());

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { starknetWallet, privyAuthenticated } = useWallet();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isAdminWallet, setIsAdminWallet] = useState(false);
  
  useEffect(() => {
    // Check if either wallet is connected
    const connected = starknetWallet.isConnected || privyAuthenticated;
    setIsWalletConnected(connected);
    
    // Check if the connected wallet is an admin wallet
    const walletAddress = starknetWallet.address?.toLowerCase() || '';
    const isAdmin = adminWallets.includes(walletAddress);
    
    console.log('Main Admin layout check:', {
      walletAddress,
      isAdmin,
      adminWallets
    });
    
    setIsAdminWallet(isAdmin);
  }, [starknetWallet.isConnected, starknetWallet.address, privyAuthenticated]);

  // Show connect wallet UI if not connected
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
  
  // Show access denied if connected but not admin
  if (isWalletConnected && !isAdminWallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6 text-red-600">Access Denied</h1>
          <p className="mb-6 text-gray-600">
            Your wallet does not have admin access rights.
          </p>
          <div className="mb-4 p-3 bg-gray-100 rounded-md text-left">
            <p className="text-sm font-medium">Connected wallet:</p>
            <p className="font-mono text-xs break-all">{starknetWallet.address}</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Please connect an authorized admin wallet to access this area.
          </p>
        </div>
      </div>
    );
  }

  // If connected and admin, render protected content
  return (
    <AdminProtectedRoute skipRedirect={true}>
      {children}
    </AdminProtectedRoute>
  );
} 