'use client';

import { useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/wallet-context';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';

export function useUserSync() {
  const { address: starknetAddress } = useWallet();
  const { user, ready: privyReady } = usePrivy();
  const evmAddress = user?.wallet?.address;

  const syncUser = useCallback(async (params: { starknetAddress?: string; evmAddress?: string }) => {
    if (!params.starknetAddress && !params.evmAddress) return;

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to sync user data');
      }
    } catch (error) {
      console.error('Error syncing user:', error);
      toast.error('Failed to sync user data');
    }
  }, []);

  // Sync user when wallet connects
  useEffect(() => {
    if (starknetAddress || (privyReady && evmAddress)) {
      syncUser({ starknetAddress, evmAddress });
    }
  }, [starknetAddress, evmAddress, privyReady, syncUser]);

  return { syncUser };
} 