'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/app/context/wallet-context';
import { approveTokens } from '@/actions/shared/starknet-transactions';
import { showToast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';

interface StarknetTokenApprovalProps {
  spenderAddress: string;
  tokenAddress: string;
  tokenAmount: string;
  onSuccess?: (txHash?: string) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  className?: string;
}

export function StarknetTokenApproval({
  spenderAddress,
  tokenAddress,
  tokenAmount,
  onSuccess,
  onError,
  buttonText = 'Approve Tokens',
  className = '',
}: StarknetTokenApprovalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const { currentAddress, activeWalletType } = useWallet();

  const handleApprove = useCallback(async () => {
    if (!currentAddress || !activeWalletType) {
      showToast('CONNECTION_ERROR');
      onError?.('Wallet not connected');
      return;
    }

    setIsApproving(true);
    showToast('TX_PENDING', 'loading');

    try {
      console.log('🔄 Approving tokens...', {
        walletType: activeWalletType,
        address: currentAddress,
        spender: spenderAddress,
        token: tokenAddress,
        amount: tokenAmount,
      });

      const result = await approveTokens(
        activeWalletType === 'starknet' ? 'starknet' : 'evm',
        currentAddress,
        spenderAddress,
        tokenAddress,
        tokenAmount
      );

      if (result.success) {
        console.log('✅ Token approval successful', {
          txHash: result.txHash,
          accountAddress: result.accountAddress,
        });
        
        showToast('TX_SUCCESS', 'success', result.txHash);
        onSuccess?.(result.txHash);
      } else {
        console.error('❌ Token approval failed:', result.error);
        showToast('TX_ERROR', 'error');
        onError?.(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Error in token approval:', error);
      showToast('TX_ERROR', 'error');
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsApproving(false);
    }
  }, [
    currentAddress,
    activeWalletType,
    spenderAddress,
    tokenAddress,
    tokenAmount,
    onSuccess,
    onError,
  ]);

  return (
    <Button
      onClick={handleApprove}
      disabled={isApproving || !currentAddress}
      className={className}
    >
      {isApproving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Approving...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
} 