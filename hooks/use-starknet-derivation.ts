import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/app/context/wallet-context';
import { useWallets } from '@privy-io/react-auth';
import { deriveAccount } from '@/actions/shared/derive-starknet-account';
import { getUserByEvmAddress } from '@/actions/users';

/**
 * Hook to derive a Starknet account from an EVM wallet
 * @returns Starknet derivation state
 */
export function useStarknetDerivation() {
  const { privyAuthenticated, privyAddress } = useWallet();
  const { wallets } = useWallets();
  const [derivedAccount, setDerivedAccount] = useState<{ starknetAddress: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const derive = useCallback(async () => {
    if (!privyAuthenticated || !privyAddress) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First check if user already exists with this EVM address
      const existingUser = await getUserByEvmAddress(privyAddress);

      if (existingUser.success && existingUser.data) {
        // User already exists with a derived account
        setDerivedAccount({
          starknetAddress: existingUser.data.starknetAddress as string,
        });
        return existingUser.data;
      }

      // Find the wallet that matches the EVM address
      const evmWallet = wallets.find(
        (w) => w.address.toLowerCase() === privyAddress.toLowerCase()
      );

      if (!evmWallet) {
        setError('Wallet not found');
        return null;
      }

      // Derive account using the centralized function
      const account = await deriveAccount(
        privyAddress,
        async (message) => {
          return evmWallet.sign(message);
        }
      );

      if (account) {
        setDerivedAccount({
          starknetAddress: account.starknetAddress as string,
        });
      }

      return account;
    } catch (err) {
      // Ignore 409 conflicts as they're expected when user already exists
      if (err instanceof Error && !err.message.includes('409')) {
        setError(err.message);
      } else {
        // If there's a 409 conflict, try to get the existing user
        try {
          const existingUser = await getUserByEvmAddress(privyAddress);
          if (existingUser.success && existingUser.data) {
            setDerivedAccount({
              starknetAddress: existingUser.data.starknetAddress as string,
            });
            return existingUser.data;
          }
        } catch (fetchError) {
          console.error('Failed to fetch existing user:', fetchError);
          setError('Failed to fetch existing user');
        }
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [privyAuthenticated, privyAddress, wallets]);

  useEffect(() => {
    if (privyAuthenticated && privyAddress && !derivedAccount && !isLoading) {
      derive();
    }
  }, [privyAuthenticated, privyAddress, derivedAccount, isLoading, derive]);

  return {
    derivedAccount,
    isLoading,
    error,
    derive,
  };
}