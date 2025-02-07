import { useCallback } from 'react';
import { useContract, useAccount, useProvider } from '@starknet-react/core';
import type { Abi } from 'starknet';

// ERC20 contract address for $LEFT token
const LEFT_TOKEN_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    inputs: [
      {
        name: "spender",
        type: "felt"
      },
      {
        name: "amount",
        type: "Uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        type: "felt"
      }
    ],
    state_mutability: "external",
    type: "function"
  },
  {
    inputs: [
      {
        name: "account",
        type: "felt"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "Uint256"
      }
    ],
    state_mutability: "view",
    type: "function"
  }
] as Abi;

interface UseTokenTransactionProps {
  address?: string;
  abi?: Abi;
}

export function useBuyTokens({ address, abi }: UseTokenTransactionProps) {
  const { contract } = useContract({
    abi,
    address: address as `0x${string}`,
  });

  // Add ERC20 contract
  const { contract: leftToken } = useContract({
    address: LEFT_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI
  });

  const { account, address: accountAddress, status } = useAccount();
  const { provider } = useProvider();

  const execute = useCallback(async (amountInWei: string) => {
    console.log('Buy Transaction - Wallet Status:', {
      hasAccount: !!account,
      accountAddress,
      connectionStatus: status,
      hasContract: !!contract,
      contractAddress: address
    });

    if (!contract || !address || !leftToken) {
      throw new Error('Contract not initialized');
    }

    if (!account) {
      throw new Error('Wallet not connected');
    }

    try {
      // Check balance first
      const balance = await leftToken.balanceOf(accountAddress);
      const amountBN = BigInt(amountInWei);
      
      console.log('Balance response:', balance);
      
      // Handle balance based on response format
      let balanceBN;
      if (typeof balance === 'string') {
        balanceBN = BigInt(balance);
      } else if (balance && typeof balance === 'object') {
        if ('balance' in balance) {
          // Handle {balance: BigIntn} format
          balanceBN = balance.balance;
        } else if ('low' in balance && 'high' in balance) {
          balanceBN = BigInt(balance.low) + (BigInt(balance.high) << BigInt(128));
        } else if (Array.isArray(balance)) {
          // Some contracts return balance as [low, high]
          balanceBN = BigInt(balance[0]) + (BigInt(balance[1]) << BigInt(128));
        } else {
          console.error('Unexpected balance format:', balance);
          throw new Error('Unexpected balance format');
        }
      } else {
        console.error('Invalid balance response:', balance);
        throw new Error('Invalid balance response');
      }
      
      console.log('Parsed balance:', balanceBN.toString());
      console.log('Amount to spend:', amountBN.toString());
      
      if (balanceBN < amountBN) {
        throw new Error(`Insufficient balance. Have: ${(Number(balanceBN) / 1e18).toFixed(6)} ETH, Need: ${(Number(amountBN) / 1e18).toFixed(6)} ETH`);
      }

      // First approve the token spend
      console.log('Approving token spend...');
      
      // Convert to Uint256 array format like in dapp-v3
      const amountLow = amountBN & ((1n << 128n) - 1n);
      const amountHigh = amountBN >> 128n;
      
      console.log('Amount components:', {
        original: amountBN.toString(),
        lowDec: amountLow.toString(),
        highDec: amountHigh.toString(),
        lowHex: '0x' + amountLow.toString(16),
        highHex: '0x' + amountHigh.toString(16)
      });
      
      // Pass amount components directly without array
      const approveCall = await leftToken.populate("approve", [
        address,
        '0x' + amountLow.toString(16),
        '0x' + amountHigh.toString(16)
      ]);
      
      console.log('Approve call details:', {
        entrypoint: approveCall.entrypoint,
        calldata: approveCall.calldata
      });
      
      const approveTx = await account.execute({
        contractAddress: LEFT_TOKEN_ADDRESS,
        entrypoint: approveCall.entrypoint,
        calldata: approveCall.calldata
      });
      
      // Wait for approval to be mined
      await provider.waitForTransaction(approveTx.transaction_hash);

      // Then execute the buy
      console.log('Executing buy...');
      const buyCall = await contract.populate('buy', [
        '0x' + amountLow.toString(16),
        '0x' + amountHigh.toString(16)
      ]);
      
      console.log('Buy call details:', {
        entrypoint: buyCall.entrypoint,
        calldata: buyCall.calldata
      });
      
      const response = await account.execute({
        contractAddress: address,
        entrypoint: buyCall.entrypoint,
        calldata: buyCall.calldata
      });
      return response;
    } catch (error) {
      console.error('Buy transaction failed:', error);
      // Extract error message from RPC error if available
      if (error instanceof Error) {
        const message = error.message;
        if (message.includes('Contract not found')) {
          throw new Error('Contract is not available. Please try again later.');
        } else if (message.includes('Insufficient balance')) {
          throw error; // Re-throw balance errors as is
        } else if (message.includes('Failed to deserialize param')) {
          throw new Error('Invalid transaction amount. Please try a smaller amount.');
        } else if (message.includes('execution has failed')) {
          throw new Error('Transaction failed. The amount may be too large for the current liquidity.');
        }
      }
      throw error;
    }
  }, [contract, address, account, accountAddress, status, leftToken, provider]);

  return {
    buyTokens: execute,
  };
}

export function useSellTokens({ address, abi }: UseTokenTransactionProps) {
  const { contract } = useContract({
    abi,
    address: address as `0x${string}`,
  });
  const { account, address: accountAddress, status } = useAccount();

  const execute = useCallback(async (amountInWei: string) => {
    console.log('Sell Transaction - Wallet Status:', {
      hasAccount: !!account,
      accountAddress,
      connectionStatus: status,
      hasContract: !!contract,
      contractAddress: address
    });

    if (!contract || !address) {
      throw new Error('Contract not initialized');
    }

    if (!account) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountBN = BigInt(amountInWei);
      console.log('Executing sell with amount:', amountBN.toString());
      
      // Convert to Uint256 array format
      const amountLow = amountBN & ((1n << 128n) - 1n);
      const amountHigh = amountBN >> 128n;
      
      console.log('Amount components:', {
        original: amountBN.toString(),
        lowDec: amountLow.toString(),
        highDec: amountHigh.toString(),
        lowHex: amountLow.toString(16),
        highHex: amountHigh.toString(16)
      });
      
      const call = await contract.populate('sell', [
        '0x' + amountLow.toString(16),
        '0x' + amountHigh.toString(16)
      ]);
      
      console.log('Sell call details:', {
        entrypoint: call.entrypoint,
        calldata: call.calldata
      });
      
      const response = await account.execute({
        contractAddress: address,
        entrypoint: call.entrypoint,
        calldata: call.calldata
      });
      return response;
    } catch (error) {
      console.error('Sell transaction failed:', error);
      throw error;
    }
  }, [contract, address, account, accountAddress, status]);

  return {
    sellTokens: execute,
  };
} 