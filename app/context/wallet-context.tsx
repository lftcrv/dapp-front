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
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { StarknetAccountDerivation } from '@/components/starknet-account-derivation';
import {
  handleStarknetConnection,
  handleEvmConnection,
} from '@/actions/shared/handle-starknet-connection';
import { signatureStorage, derivedAddressStorage } from '@/actions/shared/derive-starknet-account';
import { useConnect, useAccount, useDisconnect } from '@starknet-react/core';
import {
  useStarknetkitConnectModal,
  type StarknetkitConnector,
} from 'starknetkit';
import React from 'react';
import { deriveStarknetAccount } from '@/actions/shared/derive-starknet-account';

interface StarknetWalletState {
  wallet: {
    id: string;
    name: string;
    icon: string;
    version: string;
  } | null;
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
  derivedStarknetAddress?: string;
  
  // Utility functions
  triggerStarknetDerivation: () => Promise<boolean>;
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
  const [derivedAddress, setDerivedAddress] = useState<string | undefined>(undefined);

  // 2. All external hooks
  const {
    ready: privyReady,
    authenticated: privyAuthenticated,
    user,
    login,
    logout,
  } = usePrivy();

  // Always call the hooks, never conditionally
  const connectHook = useConnect();
  const disconnectHook = useDisconnect();
  const accountHook = useAccount();
  const modalHook = useStarknetkitConnectModal({
    connectors: connectHook.connectors as unknown as StarknetkitConnector[],
  });

  // Safely access the hook results
  const connect = connectHook.connect;
  const connectors = connectHook.connectors;
  const disconnect = disconnectHook.disconnect;
  const starknetAddress = accountHook.address;
  const isStarknetConnected = accountHook.isConnected;
  const { starknetkitConnectModal } = modalHook;

  const { wallets } = useWallets();

  // Ref to prevent duplicate handling
  const hasHandledEvmConnection = React.useRef(false);

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
          await handleStarknetConnection(starknetAddress, true);
        } catch (err) {
          console.error('Failed to handle Starknet connection:', err);
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
    if (!privyAuthenticated || !user?.wallet) return;
    try {
      // Clear signature if there is one
      await signatureStorage.clearSignature(user.wallet.address);
      await logout();
    } catch (err) {
      console.error('Failed to logout from Privy:', err);
    }
  }, [logout, privyAuthenticated, user?.wallet]);

  // Function to manually trigger Starknet account derivation
  const triggerStarknetDerivation = useCallback(async () => {
    if (!privyAuthenticated || !user?.wallet?.address) {
      console.error('❌ Cannot derive Starknet account: No EVM wallet connected');
      return false;
    }

    console.log('🔄 Manually triggering Starknet account derivation...');
    
    const wallet = wallets.find(
      (w) => w.address.toLowerCase() === user.wallet?.address.toLowerCase(),
    );
    
    if (!wallet) {
      console.error('❌ Connected wallet not found');
      return false;
    }
    
    try {
      // Clear any existing signature to force a new derivation
      await signatureStorage.clearSignature(wallet.address);
      
      // Request a new signature
      const message = `Sign this message to derive your Starknet account.\n\nEVM Address: ${wallet.address}`;
      const signature = await wallet.sign(message);
      
      // Save the signature
      await signatureStorage.saveSignature(wallet.address, signature);
      
      // Derive the Starknet account
      const account = await deriveStarknetAccount(
        wallet.address,
        async () => signature
      );
      
      if (account?.starknetAddress) {
        console.log('✅ Successfully derived Starknet account:', account.starknetAddress);
        setDerivedAddress(account.starknetAddress);
        derivedAddressStorage.saveAddress(wallet.address, account.starknetAddress);
        return true;
      } else {
        console.error('❌ Failed to derive Starknet account');
        return false;
      }
    } catch (error) {
      console.error('❌ Error during manual Starknet derivation:', error);
      return false;
    }
  }, [privyAuthenticated, user?.wallet?.address, wallets]);

  // Handle EVM connection
  useEffect(() => {
    if (!privyAuthenticated || !user?.wallet?.address) {
      hasHandledEvmConnection.current = false;
      return;
    }

    const handleEvmUser = async () => {
      console.log('🔄 Starting EVM connection process...');
      console.log('📊 Current localStorage state:', {
        keys: Object.keys(localStorage),
        length: localStorage.length
      });
      
      const wallet = wallets.find(
        (w) => w.address.toLowerCase() === user.wallet?.address.toLowerCase(),
      );
      if (!wallet) {
        console.error('❌ Connected wallet not found');
        return;
      }
      console.log('✅ Found connected wallet:', wallet.address);

      try {
        // Check if we already have a derived Starknet address
        const savedDerivedAddress = derivedAddressStorage.getAddress(wallet.address);
        if (savedDerivedAddress) {
          console.log('✅ Found existing derived Starknet address:', savedDerivedAddress);
          setDerivedAddress(savedDerivedAddress);
        }
        
        // Check if we already have a signature
        console.log('🔍 Checking for saved signature...');
        const savedSignature = await signatureStorage.getSignature(wallet.address);
        let signature = savedSignature;
        
        console.log('📊 Local storage signature check:', {
          hasSignature: !!signature,
          signatureKey: `signature_${wallet.address.toLowerCase()}`,
          signatureLength: signature?.length || 0,
          signaturePreview: signature ? `${signature.slice(0, 10)}...${signature.slice(-10)}` : 'none'
        });
        
        if (signature) {
          console.log('✅ Found existing signature in storage');
        } else {
          console.log('📝 No signature found, requesting new signature...');
          const message = `Sign this message to derive your Starknet account.\n\nEVM Address: ${wallet.address}`;
          console.log('📤 Requesting signature for message:', message);
          
          signature = await wallet.sign(message);
          console.log('✅ Got new signature from wallet:', {
            length: signature.length,
            preview: `${signature.slice(0, 10)}...${signature.slice(-10)}`
          });
          
          console.log('💾 Saving signature to storage...');
          await signatureStorage.saveSignature(wallet.address, signature);
          console.log('📊 Updated localStorage state:', {
            keys: Object.keys(localStorage),
            length: localStorage.length,
            newSignatureKey: `signature_${wallet.address.toLowerCase()}`
          });
          console.log('✅ Signature saved successfully');
        }

        // Instead of directly calling handleEvmConnection, we'll use deriveStarknetAccount
        // which will handle both the derivation and the user creation
        console.log('🔄 Deriving Starknet account from signature...');
        try {
          const account = await deriveStarknetAccount(
            wallet.address,
            async (message) => {
              // If we already have a signature, return it instead of prompting again
              if (signature) {
                console.log('✅ Using existing signature');
                return signature;
              }
              console.log('📝 Requesting new signature for derivation...');
              const newSignature = await wallet.sign(message);
              await signatureStorage.saveSignature(wallet.address, newSignature);
              return newSignature;
            }
          );
          
          if (account?.starknetAddress) {
            console.log('✅ Successfully derived Starknet account:', {
              starknetAddress: account.starknetAddress,
              evmAddress: account.evmAddress
            });
            setDerivedAddress(account.starknetAddress);
            
            // Save the derived address to localStorage for future use
            derivedAddressStorage.saveAddress(wallet.address, account.starknetAddress);
          } else {
            console.error('❌ Failed to derive Starknet account');
          }
        } catch (derivationError) {
          console.error('❌ Error during Starknet account derivation:', derivationError);
          // If derivation fails, fall back to handleEvmConnection as a last resort
          console.log('⚠️ Falling back to handleEvmConnection...');
          const result = await handleEvmConnection(wallet.address, signature);
          if (result.success) {
            console.log('✅ EVM connection handled successfully', result.data);
          } else {
            console.error('❌ Failed to handle EVM connection:', result.error);
          }
        }
      } catch (err) {
        console.error('❌ Error during EVM connection:', err);
        console.error('📊 Error context:', {
          walletAddress: wallet.address,
          localStorage: Object.keys(localStorage),
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    };

    if (!hasHandledEvmConnection.current) {
      hasHandledEvmConnection.current = true;
      handleEvmUser();
    }
  }, [privyAuthenticated, user?.wallet?.address]); // Remove wallets from dependencies

  // 4. All useEffect hooks
  useEffect(() => {
    if (isStarknetConnected && starknetAddress) {
      // Find the connected connector
      const activeConnector = connectors.find(
        (c) => c.id === 'argentX' || c.id === 'braavos',
      );

      if (!activeConnector?.available()) {
        clearStarknetState();
        return;
      }

      setStarknetWallet((prev) => ({
        ...prev,
        address: starknetAddress,
        isConnected: true,
        wallet: {
          id: activeConnector.id,
          name: activeConnector.name,
          icon: activeConnector.icon?.toString() || '',
          version: '1.0.0',
        },
      }));

      // Cache the connection
      sessionStorage.setItem(
        'starknet_wallet_cache',
        JSON.stringify({
          timestamp: Date.now(),
          data: {
            address: starknetAddress,
            isConnected: true,
            walletType: activeConnector.id,
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
              const previousConnector = connectors.find(
                (c) => c.id === data.walletType,
              );

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

  // Add new effect to handle Starknet connection state
  useEffect(() => {
    const handleStarknetState = async () => {
      if (!isStarknetConnected || !starknetAddress) return;

      console.log('🔄 Handling Starknet connection state:', {
        isConnected: isStarknetConnected,
        address: starknetAddress
      });

      try {
        await handleStarknetConnection(starknetAddress, true);
      } catch (err) {
        console.error('❌ Failed to handle Starknet connection:', err);
      }
    };

    handleStarknetState();
  }, [isStarknetConnected, starknetAddress]);

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
      derivedStarknetAddress: activeWalletType === 'privy' ? derivedAddress : starknetAddress,
      
      // Utility functions
      triggerStarknetDerivation,
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
      derivedAddress,
      starknetAddress,
      triggerStarknetDerivation,
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
