'use client'

import { createContext, useContext, useState, useCallback } from 'react';
import { connect, disconnect as starknetDisconnect } from 'starknetkit';
import { showToast } from '@/components/ui/custom-toast';

interface WalletContextType {
  address?: string;
  isConnecting: boolean;
  walletType?: 'argent' | 'braavos';
  connectToStarknet: () => Promise<void>;
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

interface StarknetWallet {
  id: string;
  isConnected: boolean;
  account?: {
    address: string;
  };
  enable: () => Promise<void>;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'argent' | 'braavos'>();
  const [lastDisconnectTime, setLastDisconnectTime] = useState<number>(0);

  const createOrUpdateUser = useCallback(async (starknetAddress: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starknetAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to create/update user');
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      showToast('error', '🤪 SMOL BRAIN MOMENT', {
        description: '💀 Failed to sync your degen data... Try again or ask the MidCurve Support!'
      });
    }
  }, []);

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
          
          // Create or update user
          await createOrUpdateUser(wallet.account.address);
          
          showToast('success', '🧠 WAGMI FRENS!', {
            description: '↗️ Your brain is now connected to LeftCurve! 📈'
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && !error.message.includes('User rejected')) {
        console.error('Error connecting wallet:', error);
        showToast('error', '😭 NGMI...', {
          description: '↘️ MidCurver moment... Failed to connect. Try again ser! 📉'
        });
      }
      // Ensure state is cleaned up on error
      await cleanupStarknet();
    } finally {
      setIsConnecting(false);
    }
  }, [cleanupStarknet, isConnecting, lastDisconnectTime, createOrUpdateUser]);

  const disconnect = useCallback(async () => {
    await cleanupStarknet();
    showToast('info', '👋 GM -> GN', {
      description: '🌙 Paper hands ... See you soon!'
    });
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