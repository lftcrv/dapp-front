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
import { showToast } from '@/lib/toast'
import { type StarknetWindowObject } from 'get-starknet-core'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

const logPerf = (action: string, duration: number, walletType: string = '') => {
  console.log('\x1b[36m%s\x1b[0m', `⏱️ ${action}${walletType ? ` (${walletType})` : ''}: ${duration.toFixed(2)}ms`);
}

interface StarknetWalletState {
  wallet: StarknetWindowObject | null;
  address?: string;
  isConnected: boolean;
}

const WalletConnectModal = React.lazy(() => 
  import('./wallet-connect-modal').then(mod => ({
    default: mod.WalletConnectModal
  }))
)

interface WalletInfoProps {
  address: string
  walletType: 'Starknet' | 'EVM'
  onCopy: (address: string) => void
}

const WalletInfo = memo(({ address, walletType, onCopy }: WalletInfoProps) => (
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
        onClick={() => onCopy(address)}
      >
        <Copy className="w-3 h-3" />
      </Button>
    </div>
  </div>
))
WalletInfo.displayName = 'WalletInfo'

interface ConnectedWalletProps {
  address: string
  walletType: 'Starknet' | 'EVM'
  onDisconnect: () => void
  onCopy: (address: string) => void
}

const ConnectedWallet = memo(({ address, walletType, onDisconnect, onCopy }: ConnectedWalletProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="font-mono text-sm">
        {walletType === 'Starknet' ? '🌟' : '⚡️'} {shortAddress(address)}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-72">
      <WalletInfo 
        address={address}
        walletType={walletType}
        onCopy={onCopy}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItem 
        onClick={onDisconnect}
        className="px-2 py-1.5 text-sm font-medium text-red-500 focus:text-red-500 focus:bg-red-500/10 data-[highlighted]:text-red-500 data-[highlighted]:bg-red-500/10 transition-colors"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Disconnect
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
))
ConnectedWallet.displayName = 'ConnectedWallet'

interface DisconnectedWalletProps {
  onClick: () => void
  isLoading: boolean
}

const DisconnectedWallet = memo(({ onClick, isLoading }: DisconnectedWalletProps) => (
  <Button
    variant="outline"
    onClick={onClick}
    disabled={isLoading}
  >
    {isLoading ? 'Checking...' : 'Connect Wallet'}
  </Button>
))
DisconnectedWallet.displayName = 'DisconnectedWallet'

export const WalletButton = memo(() => {
  const mountTime = useRef(performance.now())
  const [showWalletModal, setShowWalletModal] = useState(false)
  const { ready, authenticated, logout } = usePrivy()
  const { address: evmAddress } = useAccount()
  const [starknetWallet, setStarknetWallet] = useState<StarknetWalletState>({
    wallet: null,
    isConnected: false
  })
  const [isLoadingWallet, setIsLoadingWallet] = useState(false)

  const clearStarknetState = useCallback(() => {
    const startTime = performance.now()
    setStarknetWallet({
      wallet: null,
      isConnected: false
    })
    localStorage.removeItem('starknet_wallet')
    sessionStorage.removeItem('starknet_wallet_cache')
    logPerf('Clear State', performance.now() - startTime)
  }, [])

  const checkStarknetConnection = useCallback(async () => {
    if (isLoadingWallet || authenticated) return;
    
    const startTime = performance.now();
    setIsLoadingWallet(true);
    
    try {
      const cachedWallet = sessionStorage.getItem('starknet_wallet_cache');
      if (cachedWallet) {
        const { timestamp, data } = JSON.parse(cachedWallet);
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

  useEffect(() => {
    const walletType = starknetWallet.isConnected ? 'Starknet' : authenticated ? 'EVM' : 'None'
    logPerf('Wallet Mount', performance.now() - mountTime.current, walletType)
    checkStarknetConnection()
  }, [authenticated, starknetWallet.isConnected, checkStarknetConnection])

  useEffect(() => {
    if (authenticated && starknetWallet.isConnected) {
      clearStarknetState()
    }
  }, [authenticated, starknetWallet.isConnected, clearStarknetState])

  const handleWalletClick = useCallback(() => {
    if (!ready) return
    if (!authenticated && !starknetWallet.isConnected) {
      checkStarknetConnection()
    }
    setShowWalletModal(true)
  }, [ready, authenticated, starknetWallet.isConnected, checkStarknetConnection])

  const handleDisconnect = useCallback(async () => {
    const startTime = performance.now()
    try {
      if (authenticated) {
        await logout()
        logPerf('EVM Disconnect', performance.now() - startTime)
        showToast('EVM_DISCONNECT', 'success')
        return
      }

      if (starknetWallet.isConnected) {
        await disconnect({ clearLastWallet: true })
        setStarknetWallet({
          wallet: null,
          isConnected: false
        })
        localStorage.removeItem('starknet_wallet')
        sessionStorage.removeItem('starknet_wallet_cache')
        logPerf('Starknet Disconnect', performance.now() - startTime)
        showToast('DISCONNECT', 'success')
      }
    } catch {
      showToast('DEFAULT_ERROR', 'error')
      logPerf('Disconnect Error', performance.now() - startTime)
    }
  }, [authenticated, logout, starknetWallet.isConnected])

  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address)
  }, [])

  if (starknetWallet.isConnected || (authenticated && evmAddress)) {
    const address = starknetWallet.address || evmAddress || ''
    const walletType = starknetWallet.isConnected ? 'Starknet' : 'EVM'

    return (
      <>
        <ConnectedWallet 
          address={address}
          walletType={walletType}
          onDisconnect={handleDisconnect}
          onCopy={handleCopyAddress}
        />

        {showWalletModal && (
          <React.Suspense fallback={null}>
            <WalletConnectModal
              isOpen={showWalletModal}
              onClose={() => setShowWalletModal(false)}
              onStarknetConnect={async (wallet, address) => {
                setStarknetWallet({
                  wallet,
                  address,
                  isConnected: true
                });
                setShowWalletModal(false);
                localStorage.setItem('starknet_wallet', JSON.stringify({ address, isConnected: true }));
              }}
            />
          </React.Suspense>
        )}
      </>
    )
  }

  return (
    <>
      <DisconnectedWallet 
        onClick={handleWalletClick}
        isLoading={isLoadingWallet}
      />

      {showWalletModal && (
        <React.Suspense fallback={null}>
          <WalletConnectModal
            isOpen={showWalletModal}
            onClose={() => setShowWalletModal(false)}
            onStarknetConnect={async (wallet, address) => {
              setStarknetWallet({
                wallet,
                address,
                isConnected: true
              });
              setShowWalletModal(false);
              localStorage.setItem('starknet_wallet', JSON.stringify({ address, isConnected: true }));
            }}
          />
        </React.Suspense>
      )}
    </>
  )
})
WalletButton.displayName = 'WalletButton' 