'use client';

import React, { useState, useEffect } from 'react';
import AdminProtectedRoute from '../../../components/admin/AdminProtectedRoute';
import { useWallet } from '@/app/context/wallet-context';
import { WalletButton } from '@/components/wallet-button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { starknetWallet, privyAuthenticated } = useWallet();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  
  useEffect(() => {
    // Check if either wallet is connected
    const connected = starknetWallet.isConnected || privyAuthenticated;
    setIsWalletConnected(connected);
  }, [starknetWallet.isConnected, privyAuthenticated]);

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

  return (
    <AdminProtectedRoute>
      {children}
    </AdminProtectedRoute>
  );
} 