import { useEffect, useRef, useCallback, memo } from "react";
import { useWallet } from "@/app/context/wallet-context";
import { deriveStarknetAccount } from "@/actions/shared/derive-starknet-account";
import { showToast } from "@/lib/toast";
import type { ConnectedWallet } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";

export const StarknetAccountDerivation = memo(
  function StarknetAccountDerivation() {
    const { privyAuthenticated, privyAddress } = useWallet();
    const { wallets } = useWallets();
    const attemptRef = useRef<Record<string, boolean>>({});

    const deriveAccount = useCallback(async () => {
      if (!privyAddress) return null;

      // Find the wallet that matches the EVM address
      const evmWallet = wallets.find(
        (w: ConnectedWallet) =>
          w.address.toLowerCase() === privyAddress.toLowerCase(),
      );
      if (!evmWallet) {
        // This is an expected case when wallet is not ready yet
        return null;
      }

      try {
        const account = await deriveStarknetAccount(
          privyAddress,
          async (message) => {
            return evmWallet.sign(message);
          },
        );

        if (account?.starknetAddress) {
          showToast("DEPLOYED", "success");
        }
        return account;
      } catch (err) {
        // Only show error toast for actual derivation errors
        if (err instanceof Error && !err.message.includes("409")) {
          showToast("DEPLOY_ERROR", "error");
        }
        return null;
      }
    }, [privyAddress, wallets]);

    useEffect(() => {
      const evmAddress = privyAddress;
      if (!privyAuthenticated || !evmAddress) return;
      if (attemptRef.current[evmAddress]) return;

      deriveAccount().then((account) => {
        if (account) {
          attemptRef.current[evmAddress] = true;
        }
      });
    }, [privyAuthenticated, privyAddress, deriveAccount]);

    useEffect(() => {
      return () => {
        attemptRef.current = {};
      };
    }, []);

    // This component doesn't render anything
    return null;
  },
);
