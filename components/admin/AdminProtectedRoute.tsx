'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../hooks/use-toast';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@/app/context/wallet-context';
import { checkAdminAccessDirectly } from './admin-actions';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user, ready } = usePrivy();
  const { starknetWallet, currentAddress } = useWallet();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for Privy to be ready and wallet connections to be established
    if (!ready) return;

    // Add a small delay to ensure wallet is fully loaded
    const timeoutId = setTimeout(() => {
      verifyAdminAccess();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [ready]);

  // Separate effect to watch for wallet changes
  useEffect(() => {
    if (ready && (starknetWallet.address || currentAddress)) {
      verifyAdminAccess();
    }
  }, [currentAddress, starknetWallet.address, ready]);

  const verifyAdminAccess = async () => {
    try {
      setIsLoading(true);
      
      // Log the current state for debugging
      console.log('Verifying admin access:', {
        ready,
        userExists: !!user,
        privyWalletExists: !!user?.wallet?.address,
        privyWalletAddress: user?.wallet?.address,
        starknetWalletExists: !!starknetWallet.address,
        starknetWalletAddress: starknetWallet.address,
        currentAddress
      });

      // Check if we have any wallet address to use
      const hasWalletAddress = !!starknetWallet.address || !!currentAddress || !!user?.wallet?.address;
      
      // If no wallet address is available, wait a bit longer
      if (!hasWalletAddress) {
        console.log('No wallet address found, waiting...');
        setIsLoading(true);
        return;
      }

      // Get the wallet addresses to check
      const privyWalletAddress = user?.wallet?.address?.toLowerCase();
      const starknetWalletAddress = starknetWallet.address?.toLowerCase();
      
      console.log('User wallet details:', {
        privyAddress: privyWalletAddress,
        starknetAddress: starknetWalletAddress,
        currentAddress: currentAddress?.toLowerCase()
      });

      // Check admin access directly using server action
      // Try all possible wallet addresses
      const isAdmin = await checkAdminAccessDirectly(
        privyWalletAddress || currentAddress?.toLowerCase(), 
        starknetWalletAddress
      );
      
      console.log('Admin access check result:', isAdmin);
      
      if (isAdmin) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this page.',
          variant: 'destructive',
        });
        router.push('/');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAuthorized(false);
      toast({
        title: 'Error',
        description: 'Failed to verify admin access.',
        variant: 'destructive',
      });
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  // If still loading and not yet authorized, show loading state
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Checking wallet connection...</p>
          <p className="text-sm text-gray-500">Please make sure your wallet is connected</p>
          {starknetWallet.address && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-sm font-medium">Connected wallet:</p>
              <p className="font-mono text-xs">{starknetWallet.address}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};

export default AdminProtectedRoute; 