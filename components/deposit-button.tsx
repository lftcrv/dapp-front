'use client';

import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { DepositModal } from './deposit-modal';
import { useState } from 'react';

export function DepositButton() {
  const [showModal, setShowModal] = useState(false);
  const { authenticated } = usePrivy();
  const { address } = useAccount();

  if (!authenticated || !address) {
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
        walletType="evm"
        address={address}
      />
    </>
  );
} 