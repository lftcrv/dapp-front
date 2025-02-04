'use client';

import { useAccount, useProvider, useNetwork } from '@starknet-react/core';
import { useWallet } from '@/app/context/wallet-context';
import { useContractAbi } from '@/utils/abi';

export function useWalletStatus(contractAddress?: string) {
  const { address, isConnected, account } = useAccount();
  const { provider } = useProvider();
  const { chain } = useNetwork();
  const { starknetWallet, activeWalletType } = useWallet();
  
  // Only fetch ABI if we have a valid contract address (not undefined, not '0x0')
  const { abi, isLoading: isLoadingAbi, error: abiError } = useContractAbi(
    contractAddress && contractAddress !== '0x0' ? contractAddress : ''
  );

  // Simple ready states
  const isWalletReady = isConnected && 
    activeWalletType === 'starknet' && 
    !!starknetWallet.wallet && 
    !!address &&
    !!account;

  // Contract is ready if:
  // 1. Wallet is connected
  // 2. We have a provider
  // 3. We either have no contract address (no contract needed) or we have both a contract address and its ABI
  const isContractReady = isConnected && 
    provider != null && 
    (!contractAddress || contractAddress === '0x0' || (contractAddress && abi != null));

  const getStatus = () => {
    const walletState = {
      // Connection States
      starknetStatus: isConnected,
      activeWalletType,
      
      // Account Info
      address,
      hasAccount: !!account,
      
      // Wallet Info
      hasWallet: !!starknetWallet.wallet,
      walletType: starknetWallet.wallet?.id,
      walletChainId: chain?.id,
      
      // Provider & Contract
      hasProvider: !!provider,
      hasAbi: !!abi,
      isLoadingAbi,
      abiError,
      
      // Ready States
      isWalletReady,
      isContractReady,
    };

    console.group('Wallet Status');
    console.log(walletState);
    console.groupEnd();

    return walletState;
  };

  return {
    address,
    isConnected,
    provider,
    abi,
    isLoadingAbi,
    abiError,
    isContractReady,
    getStatus,
  };
} 