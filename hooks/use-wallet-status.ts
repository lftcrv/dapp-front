'use client';

import { useAccount, useProvider } from '@starknet-react/core';
import { useContractAbi } from '@/utils/abi';
import { RpcProvider } from 'starknet';

export function useWalletStatus(contractAddress?: string) {
  const { address, isConnected } = useAccount();
  const provider = new RpcProvider({ 
    nodeUrl: process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io'
  });
  
  // Only fetch ABI if we have a valid contract address
  const { abi, isLoading: isLoadingAbi, error: abiError } = useContractAbi(
    contractAddress && contractAddress !== '0x0' ? contractAddress : ''
  );

  // Contract is ready if:
  // 1. Wallet is connected
  // 2. We have a provider
  // 3. We either have no contract address or we have both address and ABI
  const isContractReady = isConnected && 
    provider != null && 
    (!contractAddress || contractAddress === '0x0' || (contractAddress && abi != null));

  return {
    address,
    isConnected,
    provider,
    abi,
    isLoadingAbi,
    abiError,
    isContractReady,
  };
} 