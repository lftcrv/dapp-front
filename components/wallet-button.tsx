'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { shortAddress } from '@/lib/utils';
import { Wallet2, LogOut, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { showToast } from '@/lib/toast';
import { memo, useCallback, useState } from 'react';
import { useWallet } from '@/app/context/wallet-context';

const WalletConnectModal = React.lazy(() =>
  import('./wallet-connect-modal').then((mod) => ({
    default: mod.WalletConnectModal,
  })),
);

interface WalletInfoProps {
  address: string;
  walletType: 'starknet' | 'privy';
  onCopy: (address: string) => void;
}

const WalletInfo = memo(({ address, walletType, onCopy }: WalletInfoProps) => (
  <div className="flex flex-col px-2 py-1.5 gap-1">
    <div className="flex items-center gap-2 px-2 py-1.5">
      <Wallet2 className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium text-gray-900">
        Connected {walletType === 'starknet' ? 'Starknet' : 'EVM'} Wallet
      </span>
    </div>
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-gray-50">
      <span className="font-mono text-sm text-gray-900">{shortAddress(address)}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 ml-auto hover:bg-gray-100"
        onClick={() => onCopy(address)}
      >
        <Copy className="w-3 h-3" />
      </Button>
    </div>
  </div>
));
WalletInfo.displayName = 'WalletInfo';

interface ConnectedWalletProps {
  address: string;
  walletType: 'starknet' | 'privy';
  onDisconnect: () => void;
  onCopy: (address: string) => void;
}

const ConnectedWallet = memo(
  ({ address, walletType, onDisconnect, onCopy }: ConnectedWalletProps) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="
    font-mono text-base py-5 px-5
    relative bg-white/5 backdrop-blur-sm
    border border-transparent
    before:absolute before:inset-0 before:rounded-md before:p-[1px]
    before:bg-gradient-to-r before:from-orange-500/50 before:via-purple-500/50 before:to-pink-500/50
    before:-z-10
    hover:shadow-lg hover:shadow-purple-500/10 transition-shadow
  "
        >
          {walletType === 'starknet' ? '🌟' : '⚡️'} {shortAddress(address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-white border shadow-xl z-50 relative">
        <WalletInfo address={address} walletType={walletType} onCopy={onCopy} />
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
  ),
);
ConnectedWallet.displayName = 'ConnectedWallet';

interface DisconnectedWalletProps {
  onClick: () => void;
  isLoading: boolean;
}

const DisconnectedWallet = memo(
  ({ onClick, isLoading }: DisconnectedWalletProps) => (
    <Button 
  variant="outline" 
  onClick={onClick} 
  disabled={isLoading} 
  className="
    text-base py-5 px-5
    relative bg-white
    border-0
    shadow-lg shadow-purple-500/20
    before:absolute before:inset-0 before:rounded-md before:p-[1px]
    before:bg-gradient-to-r before:from-orange-500 before:via-purple-500 before:to-pink-500
    before:-z-10
    after:absolute after:inset-[1px] after:bg-white after:rounded-[4px] after:-z-[5]
    hover:scale-105
    transition-all duration-200
    disabled:opacity-50
  "
>
  {isLoading ? 'Checking...' : 'Connect Wallet'}
</Button>
  ),
);
DisconnectedWallet.displayName = 'DisconnectedWallet';

export const WalletButton = memo(() => {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const {
    starknetWallet,
    privyAuthenticated,
    privyAddress,
    isLoading,
    activeWalletType,
    connectStarknet,
    disconnectStarknet,
    logoutFromPrivy,
  } = useWallet();

  const handleWalletClick = useCallback(() => {
    setShowWalletModal(true);
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      if (activeWalletType === 'starknet') {
        await disconnectStarknet();
        showToast('DISCONNECT', 'success');
      } else if (activeWalletType === 'privy') {
        await logoutFromPrivy();
        showToast('EVM_DISCONNECT', 'success');
      }
    } catch {
      showToast('DEFAULT_ERROR', 'error');
    }
  }, [activeWalletType, disconnectStarknet, logoutFromPrivy]);

  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address);
  }, []);

  if (starknetWallet.isConnected || privyAuthenticated) {
    const address = starknetWallet.address || privyAddress || '';
    const walletType = activeWalletType as 'starknet' | 'privy';

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
              onStarknetConnect={async () => {
                await connectStarknet();
                setShowWalletModal(false);
              }}
            />
          </React.Suspense>
        )}
      </>
    );
  }

  return (
    <>
      <DisconnectedWallet onClick={handleWalletClick} isLoading={isLoading} />

      {showWalletModal && (
        <React.Suspense fallback={null}>
          <WalletConnectModal
            isOpen={showWalletModal}
            onClose={() => setShowWalletModal(false)}
            onStarknetConnect={async () => {
              await connectStarknet();
              setShowWalletModal(false);
            }}
          />
        </React.Suspense>
      )}
    </>
  );
});
WalletButton.displayName = 'WalletButton';
