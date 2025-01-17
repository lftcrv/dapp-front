'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { connect, disconnect as starknetDisconnect } from 'starknetkit';
import { showToast } from '@/components/ui/custom-toast';
import { InjectedConnector } from 'starknetkit/injected';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

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

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'argent' | 'braavos' | 'evm'>();
  
  const { login: privyLogin, ready: privyReady, authenticated } = usePrivy();
  const { address: evmAddress, isConnected: isEvmConnected } = useAccount();

  // Update address when EVM wallet changes
  useEffect(() => {
    console.log('[WalletContext] EVM state change:', { isEvmConnected, evmAddress, walletType });
    if (isEvmConnected && evmAddress) {
      setAddress(evmAddress);
      setWalletType('evm');
    } else if (walletType === 'evm') {
      // Clear state when EVM wallet is disconnected
      setAddress(undefined);
      setWalletType(undefined);
    }
  }, [evmAddress, isEvmConnected, walletType]);

  const connectToEVM = useCallback(async () => {
    if (!privyReady || isConnecting) {
      console.log('[WalletContext] EVM connect blocked:', { privyReady, isConnecting });
      return;
    }
    console.time('[WalletContext] EVM connect');
    try {
      setIsConnecting(true);
      await privyLogin();
      console.timeEnd('[WalletContext] EVM connect');
    } catch (error) {
      console.timeEnd('[WalletContext] EVM connect');
      console.error('[WalletContext] EVM connection error:', error);
      showToast('error', '😭 NGMI...', {
        description: '↘️ Failed to connect EVM wallet. Try again! 📉'
      });
      setAddress(undefined);
      setWalletType(undefined);
    } finally {
      setIsConnecting(false);
    }
  }, [privyReady, privyLogin, isConnecting]);

  const cleanupStarknet = useCallback(async () => {
    try {
      await starknetDisconnect({ clearLastWallet: true });
    } catch (error) {
      console.log("StarkNet disconnect error (expected):", error);
    } finally {
      setAddress(undefined);
      setWalletType(undefined);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const currentType = walletType;
    
    // Clear state first to ensure UI updates immediately
    setAddress(undefined);
    setWalletType(undefined);
    
    if (currentType === 'evm') {
      // For EVM, we just clear the state since Privy handles disconnection
      showToast('info', '👋 GM -> GN', {
        description: '🌙 EVM wallet disconnected... See you soon!'
      });
    } else if (currentType) {
      // For Starknet wallets
      await cleanupStarknet();
      showToast('info', '👋 GM -> GN', {
        description: `🌙 ${currentType === 'braavos' ? 'Braavos' : 'Argent'} wallet disconnected... See you soon!`
      });
    }
  }, [cleanupStarknet, walletType]);

  // Handle automatic reconnection for Starknet
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

    // Only check Starknet connection if not authenticated with Privy
    if (!authenticated && !isEvmConnected) {
      checkConnection();
    }

    return () => {
      mounted = false;
    };
  }, [authenticated, isEvmConnected]);

  const connectToStarknet = useCallback(async () => {
    if (isConnecting) {
      console.log('[WalletContext] Starknet connect blocked:', { isConnecting });
      return;
    }

    let cleanup: (() => void) | undefined;
    console.time('[WalletContext] Starknet connect');
    
    try {
      setIsConnecting(true);
      
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

      console.log('[WalletContext] Starknet connection result:', { wallet, connectorData });

      if (!wallet || !connectorData?.account) {
        throw new Error("Failed to connect wallet");
      }

      // Set wallet info
      setAddress(connectorData.account);
      setWalletType(wallet.id === 'braavos' ? 'braavos' : 'argent');

      // Setup wallet event listeners
      const handleAccountsChanged = (accounts?: string[]) => {
        console.log('[WalletContext] Starknet accounts changed:', accounts);
        if (accounts?.[0]) {
          setAddress(accounts[0]);
        } else {
          cleanupStarknet();
        }
      };

      const handleNetworkChanged = async () => {
        console.log('[WalletContext] Starknet network changed');
        await cleanupStarknet();
        connectToStarknet();
      };

      wallet.on('accountsChanged', handleAccountsChanged);
      wallet.on('networkChanged', handleNetworkChanged);

      cleanup = () => {
        wallet.off('accountsChanged', handleAccountsChanged);
        wallet.off('networkChanged', handleNetworkChanged);
      };

      console.timeEnd('[WalletContext] Starknet connect');
      showToast('success', '🧠 WAGMI FRENS!', {
        description: `↗️ Your ${wallet.id === 'braavos' ? 'Braavos' : 'Argent'} wallet is now connected! 📈`
      });
    } catch (error) {
      console.timeEnd('[WalletContext] Starknet connect');
      if (error instanceof Error && !error.message.includes('User rejected')) {
        console.error('[WalletContext] Starknet connection error:', error);
        showToast('error', '😭 NGMI...', {
          description: '↘️ Failed to connect. Try again! 📉'
        });
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
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
} 