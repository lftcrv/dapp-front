'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { memo, useState, useEffect } from 'react';
import { showToast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { useConnect } from '@starknet-react/core';
import { StarknetkitConnector, useStarknetkitConnectModal } from 'starknetkit';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStarknetConnect: () => Promise<void>;
}

const slideAnimation = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const ErrorMessage = memo(({ message }: { message: string }) => (
  <Alert variant="destructive" className="mt-4">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{message}</AlertDescription>
  </Alert>
));
ErrorMessage.displayName = 'ErrorMessage';

export const WalletConnectModal = memo(
  ({ isOpen, onClose, onStarknetConnect }: WalletConnectModalProps) => {
    const [step, setStep] = useState<'choose' | 'evm-terms'>('choose');
    const [error, setError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    
    // Privy
    const { login, ready: privyReady } = usePrivy();
    
    // Starknet
    const { connect, connectors } = useConnect();
    const { starknetkitConnectModal } = useStarknetkitConnectModal({
      connectors: connectors as unknown as StarknetkitConnector[]
    });

    useEffect(() => {
      if (isOpen) {
        setStep('choose');
        setError(null);
      }
    }, [isOpen]);

    const handleStarknetConnect = async () => {
      onClose();
      
      try {
        const { connector } = await starknetkitConnectModal();
        if (!connector) {
          return;
        }
        
        connect({ connector });
        await onStarknetConnect();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to connect wallet';
        setError(message);
        showToast('CONNECTION_ERROR', 'error');
      }
    };

    const handlePrivyConnect = async () => {
      if (!privyReady) return;

      setError(null);
      showToast('EVM_CONNECTING', 'loading');

      try {
        await login();
        onClose();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to connect wallet';
        setError(message);
        showToast('CONNECTION_ERROR', 'error');
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
            {step === 'choose' ? (
              <motion.div
                key="choose"
                {...slideAnimation}
                className="space-y-4 mt-4"
              >
                <div className="transition-transform duration-300 hover:scale-[1.02] hover:z-10">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal rounded-xl border-neutral-200 shadow-sm hover:shadow-md hover:bg-gradient-to-r hover:from-orange-300 hover:to-purple-500 hover:text-black hover:border-black transition-all duration-300 focus-visible:ring-1 focus-visible:ring-neutral-300 focus-visible:ring-offset-2"
                    onClick={handleStarknetConnect}
                  >
                    Connect with Starknet
                  </Button>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal rounded-xl border-neutral-200 shadow-sm opacity-70 cursor-not-allowed"
                          disabled={true}
                        >
                          Connect with EVM
                          <div className="absolute right-3">
                            <Info className="h-4 w-4 text-gray-400" />
                          </div>
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      align="end"
                      className="bg-black text-white p-2 rounded-md"
                    >
                      <p>Coming soon!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
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
                    onClick={() => setStep('choose')}
                    className="flex-1 rounded-xl border-neutral-200 shadow-sm hover:shadow-md hover:bg-white hover:border-neutral-300 transition-all duration-300"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePrivyConnect}
                    disabled={!privyReady}
                    className="flex-1 rounded-xl bg-gradient-to-r from-orange-300 to-purple-500 hover:from-orange-400 hover:to-purple-600 border-0 shadow-sm hover:shadow-md transition-all duration-300 text-black"
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
WalletConnectModal.displayName = 'WalletConnectModal';