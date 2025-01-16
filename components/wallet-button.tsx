'use client'

import * as React from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { shortAddress } from '@/lib/utils'
import { Wallet2, LogOut, Copy } from 'lucide-react'
import { connect, disconnect } from 'starknetkit'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { showToast } from '@/components/ui/custom-toast'
import { type StarknetWindowObject } from 'get-starknet-core'

// Helper function for colored console logs
function logPerf(action: string, duration: number, walletType: string = '') {
  console.log('\x1b[36m%s\x1b[0m', `⏱️ ${action}${walletType ? ` (${walletType})` : ''}: ${duration.toFixed(2)}ms`);
}

interface StarknetWalletState {
  wallet: StarknetWindowObject | null;
  address?: string;
  isConnected: boolean;
}

// Lazy load modal only when needed
const WalletConnectModal = React.lazy(() => 
  import('./wallet-connect-modal').then(mod => ({
    default: mod.WalletConnectModal
  }))
);

export function WalletButton() {
  const mountTime = React.useRef(performance.now());
  const [showWalletModal, setShowWalletModal] = React.useState(false)
  const { ready, authenticated, logout } = usePrivy()
  const { address: evmAddress } = useAccount()
  const [starknetWallet, setStarknetWallet] = React.useState<StarknetWalletState>({
    wallet: null,
    isConnected: false
  })
  const [isLoadingWallet, setIsLoadingWallet] = React.useState(false)

  // Log initial mount time
  React.useEffect(() => {
    const walletType = starknetWallet.isConnected ? 'Starknet' : authenticated ? 'EVM' : 'None';
    logPerf('Wallet Mount', performance.now() - mountTime.current, walletType);
  }, [authenticated, starknetWallet.isConnected]);

  // Function to clear Starknet state with performance logging
  const clearStarknetState = React.useCallback(() => {
    const startTime = performance.now();
    setStarknetWallet({
      wallet: null,
      isConnected: false
    });
    localStorage.removeItem('starknet_wallet');
    sessionStorage.removeItem('starknet_wallet_cache');
    logPerf('Clear State', performance.now() - startTime);
  }, []);

  // Optimized connection check with caching
  const checkStarknetConnection = React.useCallback(async () => {
    if (isLoadingWallet || authenticated) return;
    
    const startTime = performance.now();
    setIsLoadingWallet(true);
    
    try {
      // Check cache first
      const cachedWallet = sessionStorage.getItem('starknet_wallet_cache');
      if (cachedWallet) {
        const { timestamp, data } = JSON.parse(cachedWallet);
        // Cache valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setStarknetWallet(data);
          logPerf('Cache Hit', performance.now() - startTime);
          return;
        }
      }

      const savedWallet = localStorage.getItem('starknet_wallet');
      if (!savedWallet) {
        logPerf('No Saved Wallet Check', performance.now() - startTime);
        return;
      }

      const { address, isConnected } = JSON.parse(savedWallet);
      if (!isConnected) {
        logPerf('Not Connected Check', performance.now() - startTime);
        return;
      }

      const connectStartTime = performance.now();
      const { wallet } = await connect({
        modalMode: "neverAsk",
        modalTheme: "dark",
        dappName: "LeftCurve",
      });
      logPerf('Starknet Connect', performance.now() - connectStartTime);
      
      if (!wallet) {
        clearStarknetState();
        logPerf('No Wallet Connect', performance.now() - startTime);
        return;
      }

      const addressCheckStartTime = performance.now();
      try {
        const [currentAddress] = await wallet.request({
          type: 'wallet_requestAccounts'
        });
        
        if (currentAddress === address) {
          const walletState = {
            wallet,
            address: currentAddress,
            isConnected: true
          };
          setStarknetWallet(walletState);
          // Cache the successful connection
          sessionStorage.setItem('starknet_wallet_cache', JSON.stringify({
            timestamp: Date.now(),
            data: walletState
          }));
          logPerf('Successful Connect', performance.now() - addressCheckStartTime);
        } else {
          clearStarknetState();
          logPerf('Address Mismatch', performance.now() - addressCheckStartTime);
        }
      } catch {
        clearStarknetState();
        logPerf('Address Check Failed', performance.now() - addressCheckStartTime);
      }
    } catch (err) {
      console.error('Failed to check Starknet connection:', err);
      clearStarknetState();
      logPerf('Connection Error', performance.now() - startTime);
    } finally {
      setIsLoadingWallet(false);
      logPerf('Total Connection Check', performance.now() - startTime);
    }
  }, [authenticated, clearStarknetState, isLoadingWallet]);

  // Only check Starknet connection when user interacts with wallet button
  const handleWalletClick = () => {
    if (!ready) return;
    if (!authenticated && !starknetWallet.isConnected) {
      checkStarknetConnection();
    }
    setShowWalletModal(true);
  };

  // Handle EVM wallet changes
  React.useEffect(() => {
    if (authenticated && starknetWallet.isConnected) {
      clearStarknetState();
    }
  }, [authenticated, starknetWallet.isConnected, clearStarknetState]);

  const handleDisconnect = async () => {
    const startTime = performance.now();
    try {
      // Handle EVM wallet disconnection first
      if (authenticated) {
        await logout();
        clearStarknetState();
        showToast('info', '👋 GM -> GN', {
          description: '🌙 EVM wallet disconnected... See you soon!'
        });
        logPerf('EVM Disconnect', performance.now() - startTime);
        return;
      }

      // Handle Starknet wallet disconnection
      if (starknetWallet.isConnected && starknetWallet.wallet) {
        try {
          await disconnect();
        } catch {
          // Ignore error, we'll clear state anyway
        }
        
        clearStarknetState();
        showToast('info', '👋 GM -> GN', {
          description: '🌙 Starknet wallet disconnected... See you soon!'
        });
        logPerf('Starknet Disconnect', performance.now() - startTime);
      }
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      showToast('error', '😭 NGMI...', {
        description: '↘️ Failed to disconnect. Try again ser! 📉'
      });
      logPerf('Disconnect Error', performance.now() - startTime);
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  // Show connected state for either Starknet or EVM wallet
  if (starknetWallet.isConnected || (authenticated && evmAddress)) {
    const address = starknetWallet.address || evmAddress || ''
    const walletType = starknetWallet.isConnected ? 'Starknet' : 'EVM'

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="font-mono text-sm"
            >
              {starknetWallet.isConnected ? '🌟' : '⚡️'} {shortAddress(address)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="flex flex-col px-2 py-1.5 gap-1">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Wallet2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Connected {walletType} Wallet</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50">
                <span className="font-mono text-sm">{shortAddress(address)}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-auto hover:bg-muted"
                  onClick={() => handleCopyAddress(address)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDisconnect}
              className="px-2 py-1.5 text-sm font-medium text-red-500 focus:text-red-500 focus:bg-red-500/10 data-[highlighted]:text-red-500 data-[highlighted]:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {showWalletModal && (
          <React.Suspense fallback={null}>
            <WalletConnectModal
              isOpen={showWalletModal}
              onClose={() => setShowWalletModal(false)}
              onStarknetConnect={(wallet: StarknetWindowObject, address: string) => {
                setStarknetWallet({
                  wallet,
                  address,
                  isConnected: true
                });
              }}
            />
          </React.Suspense>
        )}
      </>
    )
  }

  return (
    <>
      <Button
        onClick={handleWalletClick}
        disabled={!ready || isLoadingWallet}
        className="bg-gradient-to-r from-yellow-500 to-pink-500 text-white hover:opacity-90 min-w-[140px] transition-all"
      >
        {!ready || isLoadingWallet ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : (
          <>
            <Wallet2 className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>

      {showWalletModal && (
        <React.Suspense fallback={null}>
          <WalletConnectModal
            isOpen={showWalletModal}
            onClose={() => setShowWalletModal(false)}
            onStarknetConnect={(wallet: StarknetWindowObject, address: string) => {
              setStarknetWallet({
                wallet,
                address,
                isConnected: true
              });
            }}
          />
        </React.Suspense>
      )}
    </>
  )
} 