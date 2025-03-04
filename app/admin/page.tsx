'use client';

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '../context/wallet-context';

export default function AdminPage() {
  const { user } = usePrivy();
  const { starknetWallet } = useWallet();

  // Format the wallet address in different ways for debugging
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
     
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Wallet Addresses</h2>
        
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
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <div className="bg-gray-100 p-3 rounded overflow-x-auto">
          <p className="font-mono">ADMIN_WALLET_ADDRESSES from .env will be shown in server-side logs</p>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <a 
          href="/admin/access-codes" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Access Codes Dashboard
        </a>
        <a 
          href="/admin/debug" 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Debug Admin Access
        </a>
      </div>
    </div>
  );
} 