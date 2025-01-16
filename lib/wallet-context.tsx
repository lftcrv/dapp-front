'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { connect, disconnect as starknetDisconnect } from 'starknetkit';
import { showToast } from '@/components/ui/custom-toast';
import { InjectedConnector } from 'starknetkit/injected';

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

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'argent' | 'braavos'>();

  const createOrUpdateUser = useCallback(async (starknetAddress: string) => {
    if (!starknetAddress) {
      console.error('No Starknet address provided');
      return;
    }
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starknetAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to create/update user');
      }

      const data = await response.json();
      console.log('User data:', data);
    } catch (error) {
      console.error('Error creating/updating user:', error);
      showToast('error', '🤪 SMOL BRAIN MOMENT', {
        description: '💀 Failed to sync your degen data... Try again or ask the MidCurve Support!'
      });
      throw error; // Re-throw to handle in the connection flow
    }
  }, []);

  const cleanupStarknet = useCallback(async () => {
    try {
      await starknetDisconnect({ clearLastWallet: true });
      setAddress(undefined);
      setWalletType(undefined);
    } catch (error) {
      console.log("StarkNet disconnect error (expected):", error);
      setAddress(undefined);
      setWalletType(undefined);
    }
  }, []);

  const connectToStarknet = useCallback(async () => {
    if (isConnecting) {
      console.log("Connection already in progress...");
      return;
    }

    let cleanup: (() => void) | undefined;

    try {
      setIsConnecting(true);
      
      // First try to get any existing connection
      const { wallet: existingWallet, connectorData: existingConnectorData } = await connect({
        modalMode: "neverAsk",
        modalTheme: "dark",
        dappName: "LeftCurve",
      });

      // If there's an existing connection, use it
      if (existingWallet && existingConnectorData?.account) {
        console.log("Using existing connection:", { existingWallet, existingConnectorData });
        setAddress(existingConnectorData.account);
        setWalletType(existingWallet.id === 'braavos' ? 'braavos' : 'argent');
        
        try {
          await createOrUpdateUser(existingConnectorData.account);
          showToast('success', '🧠 Welcome Back!', {
            description: `↗️ Your ${existingWallet.id === 'braavos' ? 'Braavos' : 'Argent'} wallet is ready! 📈`
          });
        } catch (error) {
          console.error('User sync failed:', error);
        }
        return;
      }

      // If no existing connection, try to connect with modal
      const { wallet, connectorData } = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "dark",
        dappName: "LeftCurve",
        webWalletUrl: "https://web.argent.xyz",
        connectors: [
          new InjectedConnector({ 
            options: { 
              id: "argentX",
              name: "Argent X",
            }
          }),
          new InjectedConnector({ 
            options: { 
              id: "braavos",
              name: "Braavos",
            }
          }),
        ],
      });

      console.log("New connection result:", { wallet, connectorData });

      if (!wallet || !connectorData?.account) {
        throw new Error("Failed to connect wallet");
      }

      // Set wallet info
      const newAddress = connectorData.account;
      const newWalletType = wallet.id === 'braavos' ? 'braavos' : 'argent';
      
      setAddress(newAddress);
      setWalletType(newWalletType);

      // Create or update user
      try {
        await createOrUpdateUser(newAddress);
        
        showToast('success', '🧠 WAGMI FRENS!', {
          description: `↗️ Your ${newWalletType === 'braavos' ? 'Braavos' : 'Argent'} wallet is now connected to LeftCurve! 📈`
        });
      } catch (error) {
        console.error('User sync failed:', error);
      }

      // Setup wallet event listeners
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
    } catch (error) {
      if (error instanceof Error && !error.message.includes('User rejected')) {
        console.error('Error connecting wallet:', error);
        showToast('error', '😭 NGMI...', {
          description: '↘️ MidCurver moment... Failed to connect. Try again ser! 📉'
        });
      }
      await cleanupStarknet();
      if (cleanup) cleanup();
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, cleanupStarknet, createOrUpdateUser]);

  const disconnect = useCallback(async () => {
    const currentType = walletType;
    await cleanupStarknet();
    showToast('info', '👋 GM -> GN', {
      description: `🌙 ${currentType === 'braavos' ? 'Braavos' : 'Argent'} wallet disconnected... See you soon!`
    });
  }, [cleanupStarknet, walletType]);

  // Handle automatic reconnection
  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      try {
        const { wallet, connectorData } = await connect({
          modalMode: "neverAsk",
          modalTheme: "dark",
          dappName: "LeftCurve",
        });

        if (!mounted) return;

        if (wallet && connectorData?.account) {
          setAddress(connectorData.account);
          setWalletType(wallet.id === 'braavos' ? 'braavos' : 'argent');
        }
      } catch (error) {
        console.log("Auto-reconnect error (expected):", error);
      }
    };

    checkConnection();

    return () => {
      mounted = false;
    };
  }, []);

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