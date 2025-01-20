'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { connect, disconnect } from 'starknetkit';
import { toast } from 'sonner';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import type { StarknetWindowObject } from 'get-starknet-core';

interface WalletContextType {
  address?: string;
  isConnecting: boolean;
  walletType?: 'argent' | 'braavos' | 'evm';
  connectToStarknet: () => Promise<void>;
  connectToEVM: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

const showError = (message: string) => toast.error(message);
const showSuccess = (message: string) => toast.success(message);
const showInfo = (message: string) => toast.info(message);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'argent' | 'braavos' | 'evm'>();
  
  const { login: privyLogin, ready: privyReady, authenticated, logout } = usePrivy();
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();

  // Update address when EVM wallet changes
  useEffect(() => {
    if (isEvmConnected && evmAddress) {
      setAddress(evmAddress);
      setWalletType('evm');
    } else if (walletType === 'evm') {
      setAddress(undefined);
      setWalletType(undefined);
    }
  }, [evmAddress, isEvmConnected, walletType]);

  const connectToEVM = useCallback(async () => {
    if (!privyReady || isConnecting) return;
    
    try {
      setIsConnecting(true);
      await privyLogin();
    } catch (error) {
      console.error('EVM connection error:', error);
      showError('Failed to connect EVM wallet');
      setAddress(undefined);
      setWalletType(undefined);
    } finally {
      setIsConnecting(false);
    }
  }, [privyReady, privyLogin, isConnecting]);

  const cleanupStarknet = useCallback(async () => {
    try {
      await disconnect({ clearLastWallet: true });
    } catch (error) {
      console.log("StarkNet disconnect error (expected):", error);
    } finally {
      setAddress(undefined);
      setWalletType(undefined);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    const currentType = walletType;
    
    setAddress(undefined);
    setWalletType(undefined);
    
    if (currentType === 'evm') {
      await logout();
      showInfo('EVM wallet disconnected');
    } else if (currentType) {
      await cleanupStarknet();
      showInfo(`${currentType === 'braavos' ? 'Braavos' : 'Argent'} wallet disconnected`);
    }
  }, [cleanupStarknet, walletType, logout]);

  // Handle automatic reconnection for Starknet
  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      try {
        const { wallet } = await connect({
          modalMode: "neverAsk",
          modalTheme: "dark",
          dappName: "LeftCurve",
        });

        if (!mounted || !wallet) return;

        const [account] = await wallet.request({
          type: 'wallet_requestAccounts'
        });

        if (account) {
          setAddress(account);
          setWalletType(wallet.id === 'braavos' ? 'braavos' : 'argent');
        }
      } catch (error) {
        console.log("Auto-reconnect error (expected):", error);
      }
    };

    if (!authenticated && !isEvmConnected) {
      checkConnection();
    }

    return () => {
      mounted = false;
    };
  }, [authenticated, isEvmConnected]);

  const connectToStarknet = useCallback(async () => {
    if (isConnecting) return;

    let cleanup: (() => void) | undefined;
    
    try {
      setIsConnecting(true);
      
      const { wallet } = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "dark",
        dappName: "LeftCurve",
      }) as { wallet: StarknetWindowObject | undefined };

      if (!wallet) {
        throw new Error("Failed to connect wallet");
      }

      const [account] = await wallet.request({
        type: 'wallet_requestAccounts'
      });

      if (account) {
        setAddress(account);
        setWalletType(wallet.id === 'braavos' ? 'braavos' : 'argent');
      }

      const handleAccountsChanged = (accounts?: string[]) => {
        if (accounts?.[0]) {
          setAddress(accounts[0]);
        } else {
          cleanupStarknet();
        }
      };

      const handleNetworkChanged = async () => {
        await cleanupStarknet();
        connectToStarknet();
      };

      wallet.on('accountsChanged', handleAccountsChanged);
      wallet.on('networkChanged', handleNetworkChanged);

      cleanup = () => {
        wallet.off('accountsChanged', handleAccountsChanged);
        wallet.off('networkChanged', handleNetworkChanged);
      };

      showSuccess(`${wallet.id === 'braavos' ? 'Braavos' : 'Argent'} wallet connected`);
    } catch (error) {
      if (error instanceof Error && !error.message.includes('User rejected')) {
        console.error('Starknet connection error:', error);
        showError('Failed to connect Starknet wallet');
      }
      await cleanupStarknet();
      if (cleanup) cleanup();
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, cleanupStarknet]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        walletType,
        connectToStarknet,
        connectToEVM,
        disconnect: disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
} 