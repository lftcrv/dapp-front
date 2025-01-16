import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { showToast } from '@/components/ui/custom-toast';
import { useStarknetDerivation } from '@/lib/starknet-account';

export function StarknetAccountDerivation() {
  const { authenticated } = usePrivy();
  const { address: evmAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  // Create signer from wallet client
  const signer = walletClient ? 
    new ethers.providers.Web3Provider(
      walletClient.transport.request as unknown as ethers.providers.ExternalProvider
    ).getSigner() : null;
  
  const { derivedAccount, isDerivingAccount, deriveAccount } = useStarknetDerivation(signer);

  useEffect(() => {
    const handleAccountDerivation = async () => {
      // Check if we've already tried to derive for this address
      const lastDerivationAttempt = localStorage.getItem('last_derivation_attempt');
      const hasAttempted = lastDerivationAttempt === evmAddress;

      // Only derive if:
      // 1. We have an EVM wallet connected
      // 2. No derived account exists yet
      // 3. Not currently deriving
      // 4. Haven't attempted for this address before
      if (authenticated && evmAddress && signer && !derivedAccount && !isDerivingAccount && !hasAttempted) {
        try {
          // Mark that we're attempting derivation for this address
          localStorage.setItem('last_derivation_attempt', evmAddress);

          const account = await deriveAccount();
          if (account) {
            showToast('success', '🎉 Starknet Account Created!', {
              description: `Your Starknet account has been derived from your EVM wallet. Address: ${account.address.slice(0, 6)}...${account.address.slice(-4)}`
            });
          }
        } catch (err) {
          console.error('Failed to derive Starknet account:', err);
          showToast('error', '😢 Account Creation Failed', {
            description: err instanceof Error ? err.message : 'Could not derive your Starknet account. Please try again.'
          });
          // Clear the attempt on error so they can try again
          localStorage.removeItem('last_derivation_attempt');
        }
      }
    };

    handleAccountDerivation();
  }, [authenticated, evmAddress, signer, derivedAccount, isDerivingAccount, deriveAccount]);

  // Clear derivation attempt when disconnecting
  useEffect(() => {
    if (!authenticated || !evmAddress) {
      localStorage.removeItem('last_derivation_attempt');
    }
  }, [authenticated, evmAddress]);

  // This component doesn't render anything
  return null;
} 