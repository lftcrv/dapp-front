import { useEffect, useRef, useCallback, memo, useState } from 'react';
import { useWallet } from '@/app/context/wallet-context';
import {
  deriveStarknetAccount,
  setupGlobalDebugUtils,
} from '@/actions/shared/derive-starknet-account';
import type { ConnectedWallet } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';

// Debug helper function
function logDeploymentStatus(address: string) {
  try {
    const deploymentAttemptKey = `${address.toLowerCase()}_deployment_attempt`;
    const data = localStorage.getItem(deploymentAttemptKey);

    if (data) {
      const parsedData = JSON.parse(data);
      console.log('📊 Current deployment status for', address, ':', parsedData);

      // Check if there's a signature
      const signatureKey = `signature_${address.toLowerCase()}`;
      const hasSignature = !!localStorage.getItem(signatureKey);
      console.log('📝 Signature status:', hasSignature ? 'Present' : 'Missing');

      return parsedData;
    } else {
      console.log('📊 No deployment data found for', address);
      return null;
    }
  } catch (e) {
    console.error('❌ Error reading deployment status:', e);
    return null;
  }
}

// Debug tools section
const DebugTools = ({ address }: { address: string }) => {
  const handleDebug = useCallback(() => {
    if (typeof window !== 'undefined' && window.debugStarknetDeployment) {
      window.debugStarknetDeployment(address);
    } else {
      console.error('Debug function not available');
    }
  }, [address]);

  const handleClear = useCallback(() => {
    if (typeof window !== 'undefined' && window.clearStarknetDeploymentData) {
      window.clearStarknetDeploymentData(address);
      alert('Deployment data cleared');
    } else {
      console.error('Clear function not available');
    }
  }, [address]);

  const handleReset = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      window.resetStarknetDeploymentAttempts
    ) {
      const result = window.resetStarknetDeploymentAttempts(address);
      if (result) {
        alert('Deployment attempts reset');
      } else {
        alert('No deployment data to reset');
      }
    } else {
      console.error('Reset function not available');
    }
  }, [address]);

  const handleRetry = useCallback(() => {
    if (typeof window !== 'undefined' && window.clearStarknetDeploymentData) {
      // Clear deployment data first
      window.clearStarknetDeploymentData(address);

      // Show message and reload page
      alert(
        'Deployment data cleared. The page will now reload to retry deployment.',
      );
      window.location.reload();
    } else {
      console.error('Clear function not available');
    }
  }, [address]);

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
      <h3 className="text-sm font-medium mb-2">Debug Tools</h3>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleDebug}>
          Debug Deployment
        </Button>
        <Button variant="outline" size="sm" onClick={handleClear}>
          Clear Data
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset}>
          Reset Attempts
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleRetry}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Retry Deployment
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        You can also use these functions in the browser console:
        <br />
        <code>window.debugStarknetDeployment(&apos;{address}&apos;)</code>
        <br />
        <code>window.clearStarknetDeploymentData(&apos;{address}&apos;)</code>
        <br />
        <code>
          window.resetStarknetDeploymentAttempts(&apos;{address}&apos;)
        </code>
        <br />
        <code>window.listStarknetDeployments()</code>
      </p>
    </div>
  );
};

export const StarknetAccountDerivation = memo(
  function StarknetAccountDerivation() {
    const { privyAuthenticated, privyAddress } = useWallet();
    const { wallets } = useWallets();
    const attemptRef = useRef<Record<string, { attempted: boolean }>>({});
    const [isDerivingAccount, setIsDerivingAccount] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDebugTools, setShowDebugTools] = useState(false);

    // Initialize debug utilities when component mounts
    useEffect(() => {
      setupGlobalDebugUtils();
    }, []);

    const deriveAccount = useCallback(async () => {
      if (!privyAddress || isDerivingAccount) return null;

      // Log deployment status for debugging
      logDeploymentStatus(privyAddress);

      // Check if we've already attempted for this address
      if (!attemptRef.current[privyAddress]) {
        attemptRef.current[privyAddress] = { attempted: false };
      }

      const currentAttempt = attemptRef.current[privyAddress];

      // If we've already attempted, don't try again
      if (currentAttempt.attempted) {
        console.log(
          `⚠️ Already attempted derivation for ${privyAddress}, not retrying`,
        );

        // Check if we have deployment data to provide better error messages
        const deploymentData = logDeploymentStatus(privyAddress);
        if (deploymentData) {
          if (deploymentData.status === 'user_created_deployment_failed') {
            setError(
              `Your account was created successfully, but the wallet deployment failed. You can still use the app with limited functionality.`,
            );
          } else if (deploymentData.failed) {
            setError(
              `Starknet account deployment was attempted but failed. Use debug tools to diagnose.`,
            );
          }
        } else {
          setError(
            `Starknet account deployment was attempted but failed. Use debug tools to diagnose.`,
          );
        }

        return null;
      }

      // Find the wallet that matches the EVM address
      const evmWallet = wallets.find(
        (w: ConnectedWallet) =>
          w.address.toLowerCase() === privyAddress.toLowerCase(),
      );
      if (!evmWallet) {
        // This is an expected case when wallet is not ready yet
        console.log('⚠️ Wallet not ready yet, will retry later');
        return null;
      }

      try {
        console.log(
          '🔄 Starting Starknet account derivation from component...',
        );
        setIsDerivingAccount(true);
        setError(null);

        // Log current deployment status for debugging
        logDeploymentStatus(privyAddress);

        // First check if user already exists with this address
        console.log('🔍 Checking if user already exists...');
        try {
          const response = await fetch('/api/users');
          if (response.ok) {
            const data = await response.json();
            if (data?.users?.length > 0) {
              const existingUser = data.users.find(
                (u: User) =>
                  u.evmAddress?.toLowerCase() === privyAddress.toLowerCase() &&
                  u.starknetAddress,
              );

              if (existingUser) {
                console.log(
                  '✅ User already exists with Starknet address:',
                  existingUser.starknetAddress,
                );
                return existingUser;
              }
            }
          }
        } catch (error) {
          console.warn('⚠️ Error checking for existing user:', error);
          // Continue with derivation anyway
        }

        // Check if there's a failed deployment record in localStorage
        const deploymentAttemptKey = `${privyAddress.toLowerCase()}_deployment_attempt`;
        const previousAttempt = localStorage.getItem(deploymentAttemptKey);

        if (previousAttempt) {
          try {
            const attemptData = JSON.parse(previousAttempt);
            if (attemptData.failed) {
              console.log(
                '🔄 Found failed deployment attempt, clearing it to retry',
              );
              // Clear the failed attempt record to allow a retry
              localStorage.removeItem(deploymentAttemptKey);
            }
          } catch (e) {
            console.warn('⚠️ Error parsing previous attempt data:', e);
            localStorage.removeItem(deploymentAttemptKey);
          }
        }

        console.log('🔄 No existing user found, deriving Starknet account...');
        const account = await deriveStarknetAccount(
          privyAddress,
          async (message) => {
            console.log('📝 Requesting signature for message:', message);
            return evmWallet.sign(message);
          },
        );

        if (account?.starknetAddress) {
          console.log(
            '✅ Successfully derived Starknet account:',
            account.starknetAddress,
          );
          // Check deployment status to provide better feedback
          const deploymentData = logDeploymentStatus(privyAddress);
          if (
            deploymentData &&
            deploymentData.status === 'user_created_deployment_failed'
          ) {
            setError(
              `Your account was created successfully, but the wallet deployment failed. You can still use the app with limited functionality.`,
            );
            setShowDebugTools(true);
          }
        } else {
          console.error('❌ Failed to derive Starknet account');
        }
        return account;
      } catch (err) {
        // Only show error toast for actual derivation errors
        console.error('❌ Error during Starknet account derivation:', err);

        // Log detailed error information to help debugging
        console.error('📊 Derivation error details:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          address: privyAddress,
        });

        // Mark as attempted and show error
        currentAttempt.attempted = true;

        // Check if we have deployment data to provide better error messages
        const deploymentData = logDeploymentStatus(privyAddress);
        if (deploymentData) {
          if (deploymentData.status === 'user_created_deployment_failed') {
            setError(
              `Your account was created successfully, but the wallet deployment failed. You can still use the app with limited functionality.`,
            );
          } else if (deploymentData.failed) {
            setError(
              `Starknet account deployment was attempted but failed. Use debug tools to diagnose.`,
            );
          } else {
            setError(
              `Starknet account deployment failed. Use debug tools to diagnose.`,
            );
          }
        } else {
          setError(
            `Starknet account deployment failed. Use debug tools to diagnose.`,
          );
        }

        console.log(`⚠️ Deployment failed for ${privyAddress}, not retrying`);
        setShowDebugTools(true);

        return null;
      } finally {
        setIsDerivingAccount(false);
      }
    }, [privyAddress, wallets, isDerivingAccount]);

    useEffect(() => {
      const evmAddress = privyAddress;
      if (!privyAuthenticated || !evmAddress) return;

      // Initialize attempt tracking if not exists
      if (!attemptRef.current[evmAddress]) {
        attemptRef.current[evmAddress] = { attempted: false };
      }

      const currentAttempt = attemptRef.current[evmAddress];

      // Skip if we've already attempted for this address
      if (currentAttempt.attempted) {
        console.log(
          `⏭️ Already attempted derivation for this address:`,
          evmAddress,
        );
        return;
      }

      console.log('🔄 Attempting Starknet account derivation for:', evmAddress);

      // Mark as attempted before starting
      currentAttempt.attempted = true;

      deriveAccount().then((account) => {
        if (account) {
          console.log('✅ Derivation successful, marking as completed');
        } else {
          console.log('⚠️ Derivation unsuccessful');
          console.log('⛔ Not retrying as configured');

          // Log final status for debugging
          logDeploymentStatus(evmAddress);
        }
      });
    }, [privyAuthenticated, privyAddress, deriveAccount]);

    useEffect(() => {
      return () => {
        console.log('🧹 Cleaning up derivation attempts');
        attemptRef.current = {};
      };
    }, []);

    return (
      <div className="flex flex-col items-center justify-center w-full gap-4 p-4">
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDebugTools(!showDebugTools)}
              >
                {showDebugTools ? 'Hide Debug Tools' : 'Show Debug Tools'}
              </Button>
            </div>
          </div>
        )}

        {showDebugTools && privyAddress && (
          <DebugTools address={privyAddress} />
        )}
      </div>
    );
  },
);
