'use client';

import { useEffect, useCallback } from 'react';
import { useWallet } from '@/app/context/wallet-context';
import { usePrivy } from '@privy-io/react-auth';
import { showToast } from '@/components/ui/custom-toast';

export function useUserSync() {
  const { currentAddress: address, activeWalletType } = useWallet();
  const { ready: privyReady } = usePrivy();

  const syncUser = useCallback(async () => {
    if (!address || !activeWalletType) return;

    try {
      // Call your sync API here
      showToast('success', 'User synced successfully');
    } catch (error) {
      console.error('Failed to sync user:', error);
      showToast('error', 'Failed to sync user');
    }
  }, [address, activeWalletType]);

  useEffect(() => {
    if (privyReady && address) {
      syncUser();
    }
  }, [privyReady, address, syncUser]);

  return { syncUser };
}
