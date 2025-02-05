import { useCallback } from 'react';
import { useContract, useAccount } from '@starknet-react/core';
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
      // First approve the token spend
      console.log('Approving token spend...');
      const approveCall = await leftToken.populate("approve", [address, amountInWei]);
      await account.execute({
        contractAddress: LEFT_TOKEN_ADDRESS,
        entrypoint: approveCall.entrypoint,
        calldata: approveCall.calldata
      });

      // Then execute the buy
      console.log('Executing buy...');
      const buyCall = await contract.populate('buy', [amountInWei]);
      const response = await account.execute({
        contractAddress: address,
        entrypoint: buyCall.entrypoint,
        calldata: buyCall.calldata
      });
      return response;
    } catch (error) {
      console.error('Buy transaction failed:', error);
      throw error;
    }
  }, [contract, address, account, accountAddress, status, leftToken]);

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
      const call = await contract.populate('sell', [amountInWei]);
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