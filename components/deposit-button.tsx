'use client';

import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/wallet-context';
import { usePrivy } from '@privy-io/react-auth';
import { DepositModal } from './deposit-modal';
import { useState } from 'react';

export function DepositButton() {
  const [showModal, setShowModal] = useState(false);
  const { address: starknetAddress } = useWallet();
  const { ready: privyReady, user } = usePrivy();

  const evmAddress = user?.wallet?.address;
  const isConnected = Boolean(starknetAddress || (privyReady && evmAddress));

  if (!isConnected) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        className="bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:opacity-90"
      >
        Deposit
      </Button>

      <DepositModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        walletType={starknetAddress ? 'starknet' : 'evm'}
        address={starknetAddress || evmAddress || ''}
      />
    </>
  );
} 