'use client';

import { useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/wallet-context';
import { usePrivy } from '@privy-io/react-auth';
import { showToast } from '@/components/ui/custom-toast';

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

      // Show success toast for EVM connection
      if (params.evmAddress) {
        showToast('success', 'DEGEN DETECTED!', {
          description: '🎯 Your EVM wallet is now connected! 📈'
        });
      }
    } catch (error) {
      console.error('Error syncing user:', error);
      showToast('error', '🤪 SMOL BRAIN MOMENT', {
        description: '💀 Failed to sync your degen data... Try again or ask the MidCurve Support!'
      });
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