'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
  useRef,
  Suspense,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { StarknetAccountDerivation } from '@/components/starknet-account-derivation';
import { handleStarknetConnection } from '@/actions/shared/handle-starknet-connection';
import { clearSignature } from '@/actions/shared/derive-starknet-account';
import { useConnect, useAccount, useDisconnect } from '@starknet-react/core';
import {
  useStarknetkitConnectModal,
  type StarknetkitConnector,
} from 'starknetkit';
import { validateAccessCode } from '@/actions/access-codes/validate';
import { getUserByStarknetAddress } from '@/actions/users/get';
import { showToast } from '@/lib/toast';
import { User } from '@/types/user';

interface StarknetWalletState {
  wallet: any | null;
  address?: string;
  isConnected: boolean;
  chainId?: string;
}

interface WalletContextType {
  // Starknet state
  starknetWallet: StarknetWalletState;
  user: User | null;
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

  // Referral state
  hasValidReferral: boolean;
  isCheckingReferral: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Component that uses useSearchParams
function WalletProviderContent({ children }: { children: ReactNode }) {
  // 1. All useState hooks
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isManuallyConnecting, setIsManuallyConnecting] = useState(false);
  const [starknetWallet, setStarknetWallet] = useState<StarknetWalletState>({
    wallet: null,
    isConnected: false,
  });
  const [hasValidReferral, setHasValidReferral] = useState(false);
  const [isCheckingReferral, setIsCheckingReferral] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);

  // Add a state to track addresses we've already checked
  const [addressesChecked, setAddressesChecked] = useState<
    Record<string, boolean>
  >({});
  // Add a ref to track check attempts to persist between renders
  const referralCheckAttemptsRef = useRef<Record<string, number>>({});
  // Maximum number of times to check for a referral per address
  const MAX_CHECK_ATTEMPTS = 3;

  // 2. All router and params hooks
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || '';

  // 3. All external hooks
  const {
    ready: privyReady,
    authenticated: privyAuthenticated,
    user: privyUser,
    login,
    logout,
  } = usePrivy();

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address: starknetAddress, isConnected: isStarknetConnected } =
    useAccount();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as unknown as StarknetkitConnector[],
  });

  // Function to fetch user data from API
  const fetchUserData = useCallback(async (address: string) => {
    try {
      const result = await getUserByStarknetAddress(address);
      if (result.success && result.data) {
        setUserData(result.data);
        // If the user has a referral code, mark it as valid
        if (result.data.usedReferralCode) {
          setHasValidReferral(true);
        }
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }, []);

  // Check if user has a valid referral (either from URL or from database)
  const checkUserReferralStatus = useCallback(
    async (address: string) => {
      // Skip if we're already checking
      if (isCheckingReferral) return hasValidReferral;

      // Skip if we've already checked this address
      if (addressesChecked[address]) return hasValidReferral;

      // Check attempt count to avoid excessive API calls
      const attempts = referralCheckAttemptsRef.current[address] || 0;
      if (attempts >= MAX_CHECK_ATTEMPTS) {
        console.log(
          `Maximum referral check attempts (${MAX_CHECK_ATTEMPTS}) reached for address ${address}`,
        );
        return hasValidReferral;
      }

      // Increment the attempt counter
      referralCheckAttemptsRef.current[address] = attempts + 1;

      setIsCheckingReferral(true);
      try {
        // Mark this address as checked to prevent future checks
        setAddressesChecked((prev) => ({ ...prev, [address]: true }));

        // First, check if the user already exists and fetch user data
        const existingUser = await fetchUserData(address);

        if (existingUser) {
          // User exists, check if they've used a referral code before
          if (existingUser.usedReferralCode) {
            // User has already used a referral code
            setHasValidReferral(true);
            return true;
          }
        }

        // Either new user or existing user without a referral code
        // Check if there's a referral code in the URL
        if (referralCode) {
          // Validate the access code
          const validationResult = await validateAccessCode(
            referralCode,
            address,
          );
          if (validationResult.isValid) {
            setHasValidReferral(true);
            return true;
          }
        }

        // No valid referral found
        setHasValidReferral(false);
        return false;
      } catch (error) {
        console.error('Error checking referral status:', error);
        setHasValidReferral(false);
        return false;
      } finally {
        setIsCheckingReferral(false);
      }
    },
    [
      referralCode,
      hasValidReferral,
      addressesChecked,
      isCheckingReferral,
      fetchUserData,
    ],
  );

  // 3. All useCallback hooks
  const clearStarknetState = useCallback(() => {
    setStarknetWallet({
      wallet: null,
      isConnected: false,
    });
    setUserData(null); // Clear user data when clearing wallet state
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
  ]);

  useEffect(() => {
    const createUserAfterConnection = async () => {
      // Only proceed if wallet is connected and we have an address
      if (!isStarknetConnected || !starknetAddress || userData) {
        return;
      }

      try {
        // Check referral status for UI blurring purposes
        const hasValidRef = await checkUserReferralStatus(starknetAddress);

        // Always create/update the user, regardless of referral status
        const result = await handleStarknetConnection(
          starknetAddress,
          referralCode,
        );

        // Fetch updated user data after connection
        await fetchUserData(starknetAddress);

        // If no valid referral, still show the notification
        if (!hasValidRef && !referralCode) {
          showToast('REFERRAL_REQUIRED', 'error');
        }
      } catch (err) {
        console.error('Error creating user:', err);
        // Ignore 409 conflicts as they're expected when user already exists
        if (err instanceof Error && !err.message.includes('409')) {
          console.error('Failed to save user data:', err);
        } else {
          // If it was a 409, user exists, so fetch their data
          await fetchUserData(starknetAddress);
        }
      }
    };

    createUserAfterConnection();
  }, [
    isStarknetConnected,
    starknetAddress,
    userData,
    checkUserReferralStatus,
    referralCode,
    fetchUserData,
  ]);

  const disconnectStarknet = useCallback(async () => {
    try {
      await disconnect();
      clearStarknetState();
      setHasValidReferral(false);
      // Reset the checked addresses when disconnecting
      setAddressesChecked({});
      referralCheckAttemptsRef.current = {};
    } catch (err) {
      console.warn('Failed to disconnect wallet:', err);
    }
  }, [disconnect, clearStarknetState]);

  const loginWithPrivy = useCallback(async () => {
    if (!privyReady || privyAuthenticated) return;
    try {
      await login();
      // Note: Privy referral check will happen in the StarknetAccountDerivation component
      // after the Starknet address is derived
    } catch (err) {
      console.error('Failed to login with Privy:', err);
    }
  }, [login, privyReady, privyAuthenticated]);

  const logoutFromPrivy = useCallback(async () => {
    if (!privyAuthenticated) return;
    try {
      // Clear signature if there is one
      if (privyUser?.wallet?.address) {
        await clearSignature(privyUser.wallet.address);
      }
      await logout();
      setHasValidReferral(false);
      setUserData(null); // Clear user data on logout
      // Reset the checked addresses when logging out
      setAddressesChecked({});
      referralCheckAttemptsRef.current = {};
    } catch (err) {
      console.error('Failed to logout from Privy:', err);
    }
  }, [logout, privyAuthenticated, privyUser?.wallet?.address]);

  // 4. All useEffect hooks
  // Effect to check referral when starknet wallet connects
  useEffect(() => {
    if (
      isStarknetConnected &&
      starknetAddress &&
      !isCheckingReferral &&
      !hasValidReferral &&
      !addressesChecked[starknetAddress] &&
      (referralCheckAttemptsRef.current[starknetAddress] || 0) <
        MAX_CHECK_ATTEMPTS
    ) {
      checkUserReferralStatus(starknetAddress);
    }
  }, [
    isStarknetConnected,
    starknetAddress,
    checkUserReferralStatus,
    isCheckingReferral,
    hasValidReferral,
    addressesChecked,
  ]);

  // Effect to fetch user data when starknet address changes
  useEffect(() => {
    if (isStarknetConnected && starknetAddress && !userData) {
      fetchUserData(starknetAddress);
    }
  }, [isStarknetConnected, starknetAddress, userData, fetchUserData]);

  useEffect(() => {
    if (isStarknetConnected && starknetAddress) {
      // Find the connected connector
      const activeConnector = connectors.find(
        (c) => c.id === 'argentX' || c.id === 'braavos',
      );

      setStarknetWallet((prev) => ({
        ...prev,
        address: starknetAddress,
        isConnected: true,
        wallet: activeConnector?.available()
          ? ({
              id: activeConnector.id,
              name: activeConnector.name,
              icon: activeConnector.icon,
              version: '1.0.0',
            } as any)
          : null,
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
              const previousConnector = connectors.find(
                (c) => c.id === data.walletType,
              );

              if (previousConnector?.available()) {
                await connect({ connector: previousConnector });

                // If we have an address from cache, try to fetch user data
                if (data.address) {
                  await fetchUserData(data.address);
                }
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
    fetchUserData,
  ]);

  // Clear the referral check attempts when component unmounts
  useEffect(() => {
    return () => {
      referralCheckAttemptsRef.current = {};
    };
  }, []);

  // 5. All useMemo hooks
  const activeWalletType = useMemo((): 'starknet' | 'privy' | null => {
    if (starknetWallet.isConnected) return 'starknet';
    if (privyAuthenticated) return 'privy';
    return null;
  }, [starknetWallet.isConnected, privyAuthenticated]);

  const currentAddress = useMemo(() => {
    if (starknetWallet.isConnected) return starknetWallet.address;
    if (privyAuthenticated) return privyUser?.wallet?.address;
    return undefined;
  }, [
    starknetWallet.isConnected,
    starknetWallet.address,
    privyAuthenticated,
    privyUser?.wallet?.address,
  ]);

  const contextValue = useMemo(
    () => ({
      // Starknet state
      starknetWallet,
      user: userData,
      connectStarknet,
      disconnectStarknet,

      // Privy state
      privyReady,
      privyAuthenticated,
      privyAddress: privyUser?.wallet?.address,
      loginWithPrivy,
      logoutFromPrivy,

      // Combined state
      isLoading: isLoadingWallet || isCheckingReferral,
      activeWalletType,
      currentAddress,

      // Referral state
      hasValidReferral,
      isCheckingReferral,
    }),
    [
      starknetWallet,
      userData,
      connectStarknet,
      disconnectStarknet,
      privyReady,
      privyAuthenticated,
      privyUser?.wallet?.address,
      loginWithPrivy,
      logoutFromPrivy,
      isLoadingWallet,
      activeWalletType,
      currentAddress,
      hasValidReferral,
      isCheckingReferral,
    ],
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
      {privyAuthenticated && (
        <StarknetAccountDerivation onReferralCheck={checkUserReferralStatus} />
      )}
    </WalletContext.Provider>
  );
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading wallet information...</div>}>
      <WalletProviderContent>{children}</WalletProviderContent>
    </Suspense>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
