'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { connect, disconnect as starknetDisconnect } from 'starknetkit';
import { toast } from 'sonner';

interface WalletContextType {
  address: string | undefined;
  isConnecting: boolean;
  walletType: 'argent' | 'braavos' | undefined;
  connectToStarknet: () => Promise<void>;
  disconnect: () => Promise<void>;
}

interface StarknetWallet {
  id: string;
  enable: () => Promise<void>;
  isConnected: boolean;
  account: {
    address: string;
  };
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'argent' | 'braavos'>();
  const [lastDisconnectTime, setLastDisconnectTime] = useState<number>(0);

  const cleanupStarknet = useCallback(async () => {
    try {
      // First reset state to ensure UI updates immediately
      setAddress(undefined);
      setWalletType(undefined);
      
      // Then attempt to disconnect
      await starknetDisconnect();
      
      // Record the disconnect time
      setLastDisconnectTime(Date.now());
      
      // Force a delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log("StarkNet disconnect error (expected):", error);
      // Even if disconnect fails, ensure state is reset
      setAddress(undefined);
      setWalletType(undefined);
      setLastDisconnectTime(Date.now());
    }
  }, []);

  const connectToStarknet = useCallback(async () => {
    // Prevent rapid reconnection attempts
    const timeSinceLastDisconnect = Date.now() - lastDisconnectTime;
    if (timeSinceLastDisconnect < 1000) {
      await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastDisconnect));
    }

    if (isConnecting) {
      console.log("Connection already in progress...");
      return;
    }

    try {
      setIsConnecting(true);
      // Clean up any existing connection first
      await cleanupStarknet();
      
      // Add a small delay before attempting to connect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const connection = await connect({ 
        modalMode: "alwaysAsk",
        dappName: "LeftCurve",
      });
      
      if (connection?.wallet) {
        const wallet = connection.wallet as unknown as StarknetWallet;
        await wallet.enable();
        
        if (wallet.isConnected && wallet.account?.address) {
          setAddress(wallet.account.address);
          setWalletType(wallet.id === 'braavos' ? 'braavos' : 'argent');
          toast.success('Wallet connected successfully');
        }
      }
    } catch (error) {
      if (error instanceof Error && !error.message.includes('User rejected')) {
        console.error('Error connecting wallet:', error);
        toast.error('Failed to connect wallet');
      }
      // Ensure state is cleaned up on error
      await cleanupStarknet();
    } finally {
      setIsConnecting(false);
    }
  }, [cleanupStarknet, isConnecting, lastDisconnectTime]);

  const disconnect = useCallback(async () => {
    await cleanupStarknet();
    toast.success('Wallet disconnected');
  }, [cleanupStarknet]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        walletType,
        connectToStarknet,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 