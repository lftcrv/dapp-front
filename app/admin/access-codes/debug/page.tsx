'use client';

import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@/app/context/wallet-context';
import { checkAdminAccessDirectly } from '@/components/admin/admin-actions';
import DashboardLayout from '@/components/admin/DashboardLayout';

// Define types for API responses
interface ApiResponse {
  endpoint: string;
  status: number;
  data: unknown;
  ok: boolean;
}

export default function AccessCodesDebugPage() {
  const { user } = usePrivy();
  const { starknetWallet } = useWallet();
  const [adminCheckResult, setAdminCheckResult] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [apiResponses, setApiResponses] = useState<Record<string, ApiResponse>>({});
  const [isTestingApi, setIsTestingApi] = useState(false);

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

  const testApiEndpoints = async () => {
    setIsTestingApi(true);
    const responses: Record<string, ApiResponse> = {};
    
    try {
      // Test stats endpoint
      try {
        const response = await fetch('/api/debug/test-endpoint?endpoint=stats');
        responses.stats = await response.json();
      } catch (fetchError) {
        console.error('Error fetching stats endpoint:', fetchError);
        responses.stats = { 
          endpoint: 'stats',
          status: 500,
          data: { error: 'Failed to fetch stats', message: fetchError instanceof Error ? fetchError.message : String(fetchError) },
          ok: false
        };
      }
      
      // Test list endpoint
      try {
        const response = await fetch('/api/debug/test-endpoint?endpoint=list');
        responses.list = await response.json();
      } catch (fetchError) {
        console.error('Error fetching list endpoint:', fetchError);
        responses.list = { 
          endpoint: 'list',
          status: 500,
          data: { error: 'Failed to fetch list', message: fetchError instanceof Error ? fetchError.message : String(fetchError) },
          ok: false
        };
      }
      
      // Test activities endpoint
      try {
        const response = await fetch('/api/debug/test-endpoint?endpoint=activities');
        responses.activities = await response.json();
      } catch (fetchError) {
        console.error('Error fetching activities endpoint:', fetchError);
        responses.activities = { 
          endpoint: 'activities',
          status: 500,
          data: { error: 'Failed to fetch activities', message: fetchError instanceof Error ? fetchError.message : String(fetchError) },
          ok: false
        };
      }
      
      setApiResponses(responses);
    } catch (error) {
      console.error('Error testing API endpoints:', error);
    } finally {
      setIsTestingApi(false);
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

  const formatJsonResponse = (data: unknown) => {
    return (
      <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Access Codes Debug</h1>
        
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
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">API Endpoint Tests</h2>
          
          <button
            onClick={testApiEndpoints}
            disabled={isTestingApi}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300 mb-4"
          >
            {isTestingApi ? 'Testing...' : 'Test API Endpoints'}
          </button>
          
          {Object.keys(apiResponses).length > 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Stats Endpoint:</h3>
                {formatJsonResponse(apiResponses.stats)}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">List Endpoint:</h3>
                {formatJsonResponse(apiResponses.list)}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Activities Endpoint:</h3>
                {formatJsonResponse(apiResponses.activities)}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          <a 
            href="/admin/access-codes" 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Back to Access Codes
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
} 