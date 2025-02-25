import { useCallback } from 'react';
import {
  useContract,
  useAccount,
  useProvider,
  useSendTransaction,
  jsonRpcProvider,
} from '@starknet-react/core';
import { RpcProvider, type Abi } from 'starknet';
import { showToast } from '@/lib/toast';
import { toast } from 'sonner';
import { Chain } from '@starknet-react/chains';

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

/**
 * Token Transaction Hooks
 * 
 * Design Notes:
 * 1. Buy Flow: Requires two steps
 *    - First call: Approve ETH token contract to spend ETH (with 2% slippage buffer)
 *    - Second call: Execute buy on agent contract with exact token amount
 *    This pattern is necessary because ETH (ERC20) requires explicit approval before spending
 * 
 * 2. Sell Flow: Requires single step
 *    - Direct call: Execute sell on agent contract with exact token amount
 *    - No approval needed because:
 *      a) User is selling the agent's own tokens
 *      b) The agent contract already controls its token supply
 *      c) The sell function directly burns tokens and releases ETH
 * 
 * Implementation Details:
 * - Both flows use useSendTransaction for consistent transaction handling
 * - Both validate amounts for overflow and minimum thresholds
 * - Sell adds extra validation for token balance before execution
 * - All amounts are handled in wei/smallest unit (18 decimals for ETH, 6 for tokens)
 */

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
  
  const provider = new RpcProvider({ 
    nodeUrl: process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io'
  });
  
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

      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Buy Transaction:', {
          approve: Number(ethAmountWithSlippage) / 1e18,
          buy: Number(targetAmount) / 1e6,
        });
      }

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

  // Prepare calls directly in the hook
  const calls = useCallback(
    (amountInWei: string) => {
      if (!contract || !address) {
        return undefined;
      }

      const sellAmount = BigInt(amountInWei);

      // Validate amount
      if (sellAmount === 0n) {
        throw new Error('Amount too small');
      }

      // Check for overflow
      const MAX_UINT256 = 2n ** 256n - 1n;
      if (sellAmount > MAX_UINT256) {
        throw new Error('Amount too large - would cause overflow');
      }

      // Sell call
      const rawSellCall = {
        contractAddress: address,
        entrypoint: 'sell',
        calldata: [sellAmount.toString(), '0'],
      };

      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Sell Transaction:', {
          sell: Number(sellAmount) / 1e6,
          rawAmount: sellAmount.toString()
        });
      }

      return [rawSellCall];
    },
    [contract, address],
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
    async (amountInWei: string) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!contract || !address) {
        throw new Error('Contract not initialized');
      }

      try {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Executing sell with amount:', {
            amountInWei,
            humanReadable: Number(amountInWei) / 1e6
          });
        }

        // Check token balance before selling
        const balance = await contract.balanceOf(account.address);
        const sellAmount = BigInt(amountInWei);
        
        if (balance < sellAmount) {
          throw new Error('Insufficient token balance');
        }

        const preparedCalls = calls(amountInWei);
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
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Sell transaction failed:', error);
        }
        const errorMessage = error instanceof Error 
          ? error.message
          : 'Failed to execute sell transaction';
          
        if (errorMessage.includes('insufficient')) {
          throw new Error('Insufficient token balance to complete this sale');
        } else if (errorMessage.includes('rejected')) {
          throw new Error('Transaction rejected by wallet');
        } else {
          throw new Error(errorMessage);
        }
      }
    },
    [account, contract, address, provider, sendAsync, calls],
  );

  return {
    sellTokens: execute,
    isReady: !!contract && !!address,
    transactionData: txData,
    error: txError,
  };
}
