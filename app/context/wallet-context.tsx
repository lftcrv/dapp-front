'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { connect, disconnect } from 'starknetkit';
import { type StarknetWindowObject } from 'get-starknet-core';
import { StarknetAccountDerivation } from '@/components/starknet-account-derivation';
import { handleStarknetConnection } from '@/actions/shared/handle-starknet-connection';
import { signatureStorage } from '@/actions/shared/derive-starknet-account';

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
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
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

  // Refs for event handlers
  const walletRef = useRef(starknetWallet);
  walletRef.current = starknetWallet;

  // 3. All useCallback hooks
  const clearStarknetState = useCallback(() => {
    setStarknetWallet({
      wallet: null,
      isConnected: false,
    });
    localStorage.removeItem('starknet_wallet');
    sessionStorage.removeItem('starknet_wallet_cache');
  }, []);

  const handleAccountsChanged = useCallback(async () => {
    const accounts = await walletRef.current.wallet
      ?.request({
        type: 'wallet_requestAccounts',
      })
      .catch(() => undefined);

    if (accounts?.[0] && accounts[0] !== walletRef.current.address) {
      setStarknetWallet((prev) => ({
        ...prev,
        address: accounts[0],
      }));
    }
  }, []);

  const handleNetworkChanged = useCallback(async () => {
    const chainId = await walletRef.current.wallet
      ?.request({
        type: 'wallet_requestChainId',
      })
      .catch(() => undefined);

    if (chainId && chainId !== walletRef.current.chainId) {
      setStarknetWallet((prev) => ({
        ...prev,
        chainId: chainId,
        address: prev.address,
      }));
    }
  }, []);

  const connectStarknet = useCallback(async () => {
    if (isLoadingWallet || privyAuthenticated || isConnectModalOpen) return;

    setIsLoadingWallet(true);
    setIsManuallyConnecting(true);
    setIsConnectModalOpen(true);

    try {
      const connection = await connect({
        modalMode: 'alwaysAsk',
        modalTheme: 'dark',
        dappName: 'LeftCurve',
      });

      const { wallet, connectorData } = connection;
      if (!wallet || !connectorData?.account) {
        clearStarknetState();
        return;
      }

      // Get chain ID
      const chainId = await wallet
        .request({
          type: 'wallet_requestChainId',
        })
        .catch(() => undefined);

      // Setup wallet event listeners
      wallet.on('accountsChanged', handleAccountsChanged);
      wallet.on('networkChanged', handleNetworkChanged);

      const walletState = {
        wallet,
        address: connectorData.account,
        chainId,
        isConnected: true,
      };

      // Save wallet state before handling user data
      setStarknetWallet(walletState);
      sessionStorage.setItem(
        'starknet_wallet_cache',
        JSON.stringify({
          timestamp: Date.now(),
          data: walletState,
        }),
      );

      // Save/update user in database
      try {
        await handleStarknetConnection(connectorData.account);
      } catch (err) {
        // Ignore 409 conflicts as they're expected when user already exists
        if (err instanceof Error && !err.message.includes('409')) {
          console.error('Failed to save user data');
        }
      }
    } catch (_error) {
      console.error('Failed to connect wallet:', _error);
      setIsLoadingWallet(false);
      clearStarknetState();
    } finally {
      setIsLoadingWallet(false);
      setIsManuallyConnecting(false);
      setIsConnectModalOpen(false);
    }
  }, [
    isLoadingWallet,
    privyAuthenticated,
    isConnectModalOpen,
    clearStarknetState,
    handleAccountsChanged,
    handleNetworkChanged,
  ]);

  const disconnectStarknet = useCallback(async () => {
    try {
      // First remove event listeners if they exist
      if (walletRef.current.wallet?.off) {
        try {
          walletRef.current.wallet.off(
            'accountsChanged',
            handleAccountsChanged,
          );
          walletRef.current.wallet.off('networkChanged', handleNetworkChanged);
        } catch (err) {
          console.warn('Failed to remove wallet listeners:', err);
        }
      }

      // Then disconnect the wallet
      await disconnect({ clearLastWallet: true });

      // Clear signature if there is one
      if (walletRef.current.address) {
        signatureStorage.clearSignature(walletRef.current.address);
      }

      // Finally clear the state
      clearStarknetState();
    } catch (err) {
      console.error('Failed to disconnect Starknet wallet:', err);
      // Still try to clear state even if disconnect fails
      clearStarknetState();
    }
  }, [clearStarknetState, handleAccountsChanged, handleNetworkChanged]);

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
    const checkStarknetConnection = async () => {
      if (
        isLoadingWallet ||
        privyAuthenticated ||
        isManuallyConnecting ||
        isConnectModalOpen
      )
        return;

      try {
        // Check session storage first
        const cachedWallet = sessionStorage.getItem('starknet_wallet_cache');
        if (cachedWallet) {
          try {
            const { timestamp, data } = JSON.parse(cachedWallet);
            if (data && timestamp && Date.now() - timestamp < 5 * 60 * 1000) {
              setStarknetWallet(data);
              return;
            }
          } catch {
            // Invalid JSON in session storage, remove it
            sessionStorage.removeItem('starknet_wallet_cache');
          }
        }

        // Check local storage next
        const savedWallet = localStorage.getItem('starknet_wallet');
        if (savedWallet) {
          try {
            const data = JSON.parse(savedWallet);
            if (data?.address && data?.isConnected) {
              const connection = await connect({
                modalMode: 'neverAsk',
                modalTheme: 'dark',
                dappName: 'LeftCurve',
              });

              if (!connection.wallet || !connection.connectorData?.account) {
                clearStarknetState();
                return;
              }

              const chainId = await connection.wallet
                .request({
                  type: 'wallet_requestChainId',
                })
                .catch(() => undefined);

              connection.wallet.on('accountsChanged', handleAccountsChanged);
              connection.wallet.on('networkChanged', handleNetworkChanged);

              setStarknetWallet({
                wallet: connection.wallet,
                address: connection.connectorData.account,
                chainId,
                isConnected: true,
              });
            }
          } catch {
            // Invalid JSON in local storage, remove it
            localStorage.removeItem('starknet_wallet');
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
    isConnectModalOpen,
    clearStarknetState,
    handleAccountsChanged,
    handleNetworkChanged,
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
