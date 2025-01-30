"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { connect } from "starknetkit";
import { memo, useState, useEffect } from "react";
import { showToast } from "@/lib/toast";
import type { StarknetWindowObject } from "get-starknet-core";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStarknetConnect: (wallet: StarknetWindowObject, address: string) => void;
}

const slideAnimation = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const LoadingButton = memo(
  ({
    children,
    isLoading,
    ...props
  }: { children: React.ReactNode; isLoading: boolean } & React.ComponentProps<
    typeof Button
  >) => (
    <Button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  ),
);
LoadingButton.displayName = "LoadingButton";

const ErrorMessage = memo(({ message }: { message: string }) => (
  <Alert variant="destructive" className="mt-4">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{message}</AlertDescription>
  </Alert>
));
ErrorMessage.displayName = "ErrorMessage";

export const WalletConnectModal = memo(
  ({ isOpen, onClose, onStarknetConnect }: WalletConnectModalProps) => {
    const [step, setStep] = useState<"choose" | "evm-terms">("choose");
    const { login, ready: privyReady } = usePrivy();
    const [isConnecting, setIsConnecting] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
      if (isOpen) {
        setStep("choose");
        setIsConnecting(false);
        setError(null);
      }
    }, [isOpen]);

    const handleStarknetConnect = async () => {
      setIsConnecting(true);
      setError(null);
      const startTime = performance.now();
      showToast("CONNECTING", "loading");

      onClose();

      try {
        const { wallet, connectorData } = await connect({
          modalMode: "alwaysAsk",
          modalTheme: "dark",
          dappName: "LeftCurve",
          webWalletUrl: "https://web.argent.xyz",
        });

        if (wallet && connectorData?.account) {
          onStarknetConnect(wallet, connectorData.account);
          console.log(
            "\x1b[36m%s\x1b[0m",
            `⏱️ Starknet Connection (Starknet): ${(performance.now() - startTime).toFixed(2)}ms`,
          );
          showToast("CONNECTED", "success");
        } else {
          throw new Error("Failed to connect wallet");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to connect wallet";
        setError(message);
        showToast("CONNECTION_ERROR", "error");
      } finally {
        setIsConnecting(false);
      }
    };

    const handlePrivyConnect = async () => {
      if (!privyReady) return;

      setIsConnecting(true);
      setError(null);
      showToast("EVM_CONNECTING", "loading");

      try {
        await login();
        onClose();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to connect wallet";
        setError(message);
        showToast("CONNECTION_ERROR", "error");
      } finally {
        setIsConnecting(false);
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Choose your preferred wallet to connect to the application.
            </DialogDescription>
          </DialogHeader>
          <AnimatePresence mode="wait">
            {step === "choose" ? (
              <motion.div
                key="choose"
                {...slideAnimation}
                className="space-y-4 mt-4"
              >
                <LoadingButton
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={handleStarknetConnect}
                  isLoading={isConnecting}
                >
                  Connect with Starknet
                </LoadingButton>
                <LoadingButton
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setStep("evm-terms")}
                  isLoading={isConnecting}
                  disabled={!privyReady}
                >
                  Connect with EVM
                </LoadingButton>
                {error && <ErrorMessage message={error} />}
              </motion.div>
            ) : (
              <motion.div
                key="evm-terms"
                {...slideAnimation}
                className="space-y-4 mt-4"
              >
                <div className="text-sm text-muted-foreground">
                  By connecting your wallet, you agree to our Terms of Service
                  and Privacy Policy.
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <div className="flex justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("choose")}
                    disabled={isConnecting}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePrivyConnect}
                    disabled={!privyReady || isConnecting}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
                {error && <ErrorMessage message={error} />}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    );
  },
);
WalletConnectModal.displayName = "WalletConnectModal";
