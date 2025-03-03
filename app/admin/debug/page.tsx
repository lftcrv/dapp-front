'use client';

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@/app/context/wallet-context';
import { checkAdminAccessDirectly } from '@/components/admin/admin-actions';

export default function DebugPage() {
  const { user } = usePrivy();
  const { starknetWallet } = useWallet();
  const [adminCheckResult, setAdminCheckResult] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkAdminAccess = async () => {
    try {
      setIsChecking(true);
      const privyWalletAddress = user?.wallet?.address?.toLowerCase();
      const starknetWalletAddress = starknetWallet.address?.toLowerCase();
      
      console.log('Checking admin access for:', {
        privyWalletAddress,
        starknetWalletAddress
      });
      
      const result = await checkAdminAccessDirectly(privyWalletAddress, starknetWalletAddress);
      setAdminCheckResult(result);
    } catch (error) {
      console.error('Error checking admin access:', error);
      setAdminCheckResult(false);
    } finally {
      setIsChecking(false);
    }
  };

  const formatWalletAddress = (address?: string) => {
    if (!address) return 'Not connected';
    
    return (
      <div className="space-y-2">
        <div>
          <span className="font-semibold">Original:</span> {address}
        </div>
        <div>
          <span className="font-semibold">Lowercase:</span> {address.toLowerCase()}
        </div>
        <div>
          <span className="font-semibold">Without 0x:</span> {address.startsWith('0x') ? address.slice(2) : address}
        </div>
        <div>
          <span className="font-semibold">Lowercase without 0x:</span> {address.toLowerCase().startsWith('0x') ? address.toLowerCase().slice(2) : address.toLowerCase()}
        </div>
        <div>
          <span className="font-semibold">Length:</span> {address.length}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Access Debug</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Wallet Addresses</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Privy Wallet Address:</h3>
            <div className="bg-gray-100 p-3 rounded overflow-x-auto">
              {formatWalletAddress(user?.wallet?.address)}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Starknet Wallet Address:</h3>
            <div className="bg-gray-100 p-3 rounded overflow-x-auto">
              {formatWalletAddress(starknetWallet.address)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Admin Access Check</h2>
        
        <button
          onClick={checkAdminAccess}
          disabled={isChecking}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          {isChecking ? 'Checking...' : 'Check Admin Access'}
        </button>
        
        {adminCheckResult !== null && (
          <div className={`mt-4 p-3 rounded ${adminCheckResult ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-medium">
              {adminCheckResult 
                ? '✅ You have admin access!' 
                : '❌ You do not have admin access.'}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex space-x-4">
        <a 
          href="/admin" 
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Back to Admin
        </a>
        <a 
          href="/admin/access-codes" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Access Codes Dashboard
        </a>
      </div>
    </div>
  );
} 