import { useState } from 'react';
import type { ConnectedWallet } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { deriveStarknetAccount } from '@/actions/shared/derive-starknet-account';
import type { User } from '@/lib/types';

// DEBUG LOGS: Prefix for easy removal
const DEBUG = {
  log: (message: string, ...args: unknown[]) =>
    console.log('[Starknet Hook]:', message, ...args),
  error: (message: string, ...args: unknown[]) =>
    console.error('[Starknet Hook Error]:', message, ...args),
};

export function useStarknetDerivation(): {
  derivedAccount: User | null;
  isDerivingAccount: boolean;
  deriveAccount: (evmAddress: string) => Promise<User | null>;
} {
  const [isDerivingAccount, setIsDerivingAccount] = useState(false);
  const [derivedAccount, setDerivedAccount] = useState<User | null>(null);
  const { wallets } = useWallets();

  async function deriveAccount(evmAddress: string): Promise<User | null> {
    try {
      DEBUG.log('Starting account derivation process');
      setIsDerivingAccount(true);

      // First check if user already exists with both addresses
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      if (data?.users?.length > 0) {
        const existingUser = data.users.find(
          (u: User) =>
            u.evmAddress?.toLowerCase() === evmAddress.toLowerCase() &&
            u.starknetAddress &&
            u.type === 'derived',
        );

        if (existingUser) {
          DEBUG.log('Found existing derived user:', existingUser);
          setDerivedAccount(existingUser);
          return existingUser;
        } else {
          DEBUG.log(
            'No existing derived user found, proceeding with derivation',
          );
        }
      }

      // Find the connected EVM wallet
      const evmWallet = wallets.find(
        (w: ConnectedWallet) =>
          w.address.toLowerCase() === evmAddress.toLowerCase(),
      );
      if (!evmWallet) {
        DEBUG.error('No matching EVM wallet found');
        return null;
      }

      // If no existing derived user, proceed with derivation
      DEBUG.log('Requesting signature from wallet:', evmAddress);
      const account = await deriveStarknetAccount(
        evmAddress,
        async (message: string) => {
          DEBUG.log('Requesting signature for message:', message);
          try {
            const signature = await evmWallet.sign(message);
            DEBUG.log('Signature received:', signature);
            return signature;
          } catch (err) {
            DEBUG.error('Failed to get signature:', err);
            throw err;
          }
        },
      );

      if (account) {
        setDerivedAccount(account);
      }
      return account;
    } catch (err) {
      DEBUG.error('Failed to derive account:', err);
      return null;
    } finally {
      setIsDerivingAccount(false);
      DEBUG.log('Derivation process completed');
    }
  }

  return {
    derivedAccount,
    isDerivingAccount,
    deriveAccount,
  };
}
