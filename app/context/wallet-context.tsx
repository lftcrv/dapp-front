'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { type StarknetWindowObject } from 'get-starknet-core';
import { StarknetAccountDerivation } from '@/components/starknet-account-derivation';
import { handleStarknetConnection } from '@/actions/shared/handle-starknet-connection';
import { signatureStorage } from '@/actions/shared/derive-starknet-account';
import { useConnect, useAccount, useDisconnect } from "@starknet-react/core";
import { useStarknetkitConnectModal, type StarknetkitConnector } from "starknetkit";

interface StarknetWalletState {
  wallet: StarknetWindowObject | null;
  address?: string;
  isConnected: boolean;
  chainId?: string;
}

interface WalletContextType {
  // Starknet state
  starknetWallet: StarknetWalletState;
  connectStarknet: () => Promise<void>;
  disconnectStarknet: () => Promise<void>;

  // Privy state
  privyReady: boolean;
  privyAuthenticated: boolean;
  privyAddress?: string;
  loginWithPrivy: () => Promise<void>;
  logoutFromPrivy: () => Promise<void>;

  // Combined state
  isLoading: boolean;
  activeWalletType: 'starknet' | 'privy' | null;
  currentAddress?: string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  // 1. All useState hooks
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isManuallyConnecting, setIsManuallyConnecting] = useState(false);
  const [starknetWallet, setStarknetWallet] = useState<StarknetWalletState>({
    wallet: null,
    isConnected: false,
  });

  // 2. All external hooks
  const {
    ready: privyReady,
    authenticated: privyAuthenticated,
    user,
    login,
    logout,
  } = usePrivy();

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address: starknetAddress, isConnected: isStarknetConnected } = useAccount();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as unknown as StarknetkitConnector[]
  });

  // 3. All useCallback hooks
  const clearStarknetState = useCallback(() => {
    setStarknetWallet({
      wallet: null,
      isConnected: false,
    });
    localStorage.removeItem('starknet_wallet');
    sessionStorage.removeItem('starknet_wallet_cache');
  }, []);

  const connectStarknet = useCallback(async () => {
    if (isLoadingWallet || privyAuthenticated) return;

    setIsLoadingWallet(true);
    setIsManuallyConnecting(true);

    try {
      const { connector } = await starknetkitConnectModal();
      if (!connector) {
        return;
      }

      await connect({ connector });

      // Save/update user in database only if we have an address
      if (starknetAddress) {
        try {
          await handleStarknetConnection(starknetAddress);
        } catch (err) {
          // Ignore 409 conflicts as they're expected when user already exists
          if (err instanceof Error && !err.message.includes('409')) {
            console.error('Failed to save user data');
          }
        }
      }
    } catch (_error) {
      console.error('Failed to connect wallet:', _error);
      clearStarknetState();
    } finally {
      setIsLoadingWallet(false);
      setIsManuallyConnecting(false);
    }
  }, [
    isLoadingWallet,
    privyAuthenticated,
    clearStarknetState,
    connect,
    starknetkitConnectModal,
    starknetAddress,
  ]);

  const disconnectStarknet = useCallback(async () => {
    try {
      await disconnect();
      clearStarknetState();
    } catch (err) {
      console.warn('Failed to disconnect wallet:', err);
    }
  }, [disconnect, clearStarknetState]);

  const loginWithPrivy = useCallback(async () => {
    if (!privyReady || privyAuthenticated) return;
    try {
      await login();
    } catch (err) {
      console.error('Failed to login with Privy:', err);
    }
  }, [login, privyReady, privyAuthenticated]);

  const logoutFromPrivy = useCallback(async () => {
    if (!privyAuthenticated) return;
    try {
      // Clear signature if there is one
      if (user?.wallet?.address) {
        signatureStorage.clearSignature(user.wallet.address);
      }
      await logout();
    } catch (err) {
      console.error('Failed to logout from Privy:', err);
    }
  }, [logout, privyAuthenticated, user?.wallet?.address]);

  // 4. All useEffect hooks
  useEffect(() => {
    if (isStarknetConnected && starknetAddress) {
      // Find the connected connector
      const activeConnector = connectors.find(c => c.id === 'argentX' || c.id === 'braavos');
      
      setStarknetWallet((prev) => ({
        ...prev,
        address: starknetAddress,
        isConnected: true,
        wallet: activeConnector?.available() ? {
          id: activeConnector.id,
          name: activeConnector.name,
          icon: activeConnector.icon,
          version: '1.0.0',
        } as StarknetWindowObject : null,
      }));

      // Cache the connection
      sessionStorage.setItem(
        'starknet_wallet_cache',
        JSON.stringify({
          timestamp: Date.now(),
          data: {
            address: starknetAddress,
            isConnected: true,
            walletType: activeConnector?.id,
          },
        }),
      );
    } else {
      clearStarknetState();
    }
  }, [starknetAddress, isStarknetConnected, clearStarknetState, connectors]);

  // Handle auto-reconnection
  useEffect(() => {
    const checkStarknetConnection = async () => {
      if (
        isLoadingWallet ||
        privyAuthenticated ||
        isManuallyConnecting ||
        isStarknetConnected
      )
        return;

      try {
        // Check session storage first
        const cachedWallet = sessionStorage.getItem('starknet_wallet_cache');
        if (cachedWallet) {
          try {
            const { timestamp, data } = JSON.parse(cachedWallet);
            if (data && timestamp && Date.now() - timestamp < 5 * 60 * 1000) {
              // Find the previously used connector
              const previousConnector = connectors.find(c => c.id === data.walletType);
              
              if (previousConnector?.available()) {
                await connect({ connector: previousConnector });
              }
              return;
            }
          } catch {
            sessionStorage.removeItem('starknet_wallet_cache');
          }
        }
      } catch (_error) {
        console.error('Failed to reconnect wallet:', _error);
        clearStarknetState();
      }
    };

    checkStarknetConnection();
  }, [
    isLoadingWallet,
    privyAuthenticated,
    isManuallyConnecting,
    isStarknetConnected,
    clearStarknetState,
    connect,
    connectors,
  ]);

  // 5. All useMemo hooks
  const activeWalletType = useMemo((): 'starknet' | 'privy' | null => {
    if (starknetWallet.isConnected) return 'starknet';
    if (privyAuthenticated) return 'privy';
    return null;
  }, [starknetWallet.isConnected, privyAuthenticated]);

  const currentAddress = useMemo(() => {
    if (starknetWallet.isConnected) return starknetWallet.address;
    if (privyAuthenticated) return user?.wallet?.address;
    return undefined;
  }, [
    starknetWallet.isConnected,
    starknetWallet.address,
    privyAuthenticated,
    user?.wallet?.address,
  ]);

  const contextValue = useMemo(
    () => ({
      // Starknet state
      starknetWallet,
      connectStarknet,
      disconnectStarknet,

      // Privy state
      privyReady,
      privyAuthenticated,
      privyAddress: user?.wallet?.address,
      loginWithPrivy,
      logoutFromPrivy,

      // Combined state
      isLoading: isLoadingWallet,
      activeWalletType,
      currentAddress,
    }),
    [
      starknetWallet,
      connectStarknet,
      disconnectStarknet,
      privyReady,
      privyAuthenticated,
      user?.wallet?.address,
      loginWithPrivy,
      logoutFromPrivy,
      isLoadingWallet,
      activeWalletType,
      currentAddress,
    ],
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
      {privyAuthenticated && <StarknetAccountDerivation />}
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
