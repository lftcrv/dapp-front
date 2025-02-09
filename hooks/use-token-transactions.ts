import { useCallback } from 'react';
import {
  useContract,
  useAccount,
  useProvider,
  useSendTransaction,
} from '@starknet-react/core';
import type { Abi } from 'starknet';
import { showToast } from '@/lib/toast';
import { toast } from 'sonner';

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    state_mutability: 'external',
    inputs: [
      {
        name: 'spender',
        type: 'core::starknet::contract_address::ContractAddress',
      },
      {
        name: 'amount',
        type: 'core::integer::u256',
      },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'balanceOf',
    state_mutability: 'view',
    inputs: [
      {
        name: 'account',
        type: 'core::starknet::contract_address::ContractAddress',
      },
    ],
    outputs: [
      {
        name: 'balance',
        type: 'core::integer::u256',
      },
    ],
  },
] as const satisfies Abi;

interface UseTokenTransactionProps {
  address?: string;
  abi?: Abi;
}

export function useBuyTokens({ address, abi }: UseTokenTransactionProps) {
  // Ensure contract address has correct format
  const formattedAddress = address
    ? address.startsWith('0x0')
      ? address
      : `0x0${address.slice(2)}`
    : undefined;

  const { contract } = useContract({
    abi,
    address: formattedAddress as `0x0${string}`,
  });

  const { contract: ethToken } = useContract({
    address: process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS as `0x0${string}`,
    abi: ERC20_ABI,
  });

  const { account } = useAccount();
  const { provider } = useProvider();

  // Prepare calls directly in the hook
  const calls = useCallback(
    (tokenAmount: string, requiredEthAmount: string) => {
      if (!contract || !address || !ethToken) {
        return undefined;
      }

      // Parse amounts - ethAmount for approve, tokenAmount for buy
      const ethAmount = BigInt(requiredEthAmount);
      const targetAmount = BigInt(tokenAmount);

      // Add 2% slippage buffer to ETH amount for approve
      const slippageBuffer = (ethAmount * 2n) / 100n;
      const ethAmountWithSlippage = ethAmount + slippageBuffer;

      // Validate amounts
      if (targetAmount === 0n || ethAmount === 0n) {
        throw new Error('Amount too small');
      }

      // Check for overflow
      const MAX_UINT256 = 2n ** 256n - 1n;
      if (ethAmountWithSlippage > MAX_UINT256 || targetAmount > MAX_UINT256) {
        throw new Error('Amount too large - would cause overflow');
      }

      // Approve ETH spending (with slippage buffer)
      const rawApproveCall = {
        contractAddress: process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS as string,
        entrypoint: 'approve',
        calldata: [contract.address, ethAmountWithSlippage.toString(), '0'],
      };

      // Buy with target token amount
      const rawBuyCall = {
        contractAddress: contract.address,
        entrypoint: 'buy',
        calldata: [targetAmount.toString(), '0'],
      };

      // Only log essential transaction info
      console.log('🔄 Transaction:', {
        approve: Number(ethAmountWithSlippage) / 1e18,
        buy: Number(targetAmount) / 1e6,
      });

      return [rawApproveCall, rawBuyCall];
    },
    [contract, address, ethToken],
  );

  // Setup transaction hook
  const {
    sendAsync,
    data: txData,
    error: txError,
  } = useSendTransaction({
    calls: undefined,
  });

  const execute = useCallback(
    async (tokenAmount: string, requiredEthAmount: string) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!contract || !address || !ethToken) {
        throw new Error('Contracts not initialized');
      }

      try {
        const preparedCalls = await calls(tokenAmount, requiredEthAmount);
        if (!preparedCalls) {
          throw new Error('Failed to prepare transaction calls');
        }

        // Send transaction
        const response = await sendAsync(preparedCalls);

        if (response?.transaction_hash) {
          const txHash = response.transaction_hash;
          const explorerUrl = `https://sepolia.voyager.online/tx/${txHash}`;

          // Show pending toast with explorer link
          const pendingToastId = showToast('TX_PENDING', 'loading', {
            url: explorerUrl,
            text: 'View on Explorer',
          });

          try {
            // Wait for confirmation
            await provider.waitForTransaction(txHash);
            // Dismiss pending toast and show success with link
            toast.dismiss(pendingToastId);
            showToast('TX_SUCCESS', 'success', {
              url: explorerUrl,
              text: 'View on Explorer',
            });
          } catch (error) {
            // Dismiss pending toast and show error
            toast.dismiss(pendingToastId);
            showToast('TX_ERROR', 'error');
            throw error;
          }
        }

        return response;
      } catch (error) {
        console.error('Transaction failed:', error);
        showToast('TX_ERROR', 'error');
        throw error;
      }
    },
    [account, contract, address, ethToken, provider, sendAsync, calls],
  );

  return {
    buyTokens: execute,
    isReady: !!(contract && address && ethToken),
    transactionData: txData,
    error: txError,
  };
}

export function useSellTokens({ address, abi }: UseTokenTransactionProps) {
  const { contract } = useContract({
    abi,
    address: address as `0x0${string}`,
  });
  const { account } = useAccount();
  const { provider } = useProvider();

  const execute = useCallback(
    async (amountInWei: string) => {
      if (!contract || !address) {
        throw new Error('Contract not initialized');
      }

      if (!account) {
        throw new Error('Wallet not connected');
      }

      try {
        const amountBN = amountInWei + 'n';
        console.log('Executing sell with amount:', amountBN);

        const call = await contract.populate('sell', [amountBN]);
        const response = await account.execute({
          contractAddress: address,
          entrypoint: call.entrypoint,
          calldata: call.calldata,
        });

        if (response?.transaction_hash) {
          const txHash = response.transaction_hash;
          const explorerUrl = `https://sepolia.voyager.online/tx/${txHash}`;

          // Show pending toast with explorer link
          const pendingToastId = showToast('TX_PENDING', 'loading', {
            url: explorerUrl,
            text: 'View on Explorer',
          });

          try {
            // Wait for confirmation
            await provider.waitForTransaction(txHash);
            // Dismiss pending toast and show success with link
            toast.dismiss(pendingToastId);
            showToast('TX_SUCCESS', 'success', {
              url: explorerUrl,
              text: 'View on Explorer',
            });
          } catch (error) {
            // Dismiss pending toast and show error
            toast.dismiss(pendingToastId);
            showToast('TX_ERROR', 'error');
            throw error;
          }
        }

        return response;
      } catch (error) {
        console.error('Transaction failed:', error);
        showToast('TX_ERROR', 'error');
        throw error;
      }
    },
    [contract, address, account, provider],
  );

  return {
    sellTokens: execute,
  };
}
