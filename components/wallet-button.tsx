"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { shortAddress } from "@/lib/utils";
import { Wallet2, LogOut, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { showToast } from "@/lib/toast";
import { memo, useCallback, useState } from "react";
import { useWallet } from "@/app/context/wallet-context";

const WalletConnectModal = React.lazy(() =>
  import("./wallet-connect-modal").then((mod) => ({
    default: mod.WalletConnectModal,
  })),
);

interface WalletInfoProps {
  address: string;
  walletType: "starknet" | "privy";
  onCopy: (address: string) => void;
}

const WalletInfo = memo(({ address, walletType, onCopy }: WalletInfoProps) => (
  <div className="flex flex-col px-2 py-1.5 gap-1">
    <div className="flex items-center gap-2 px-2 py-1.5">
      <Wallet2 className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium">
        Connected {walletType === "starknet" ? "Starknet" : "EVM"} Wallet
      </span>
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
));
WalletInfo.displayName = "WalletInfo";

interface ConnectedWalletProps {
  address: string;
  walletType: "starknet" | "privy";
  onDisconnect: () => void;
  onCopy: (address: string) => void;
}

const ConnectedWallet = memo(
  ({ address, walletType, onDisconnect, onCopy }: ConnectedWalletProps) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="font-mono text-sm">
          {walletType === "starknet" ? "🌟" : "⚡️"} {shortAddress(address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
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
ConnectedWallet.displayName = "ConnectedWallet";

interface DisconnectedWalletProps {
  onClick: () => void;
  isLoading: boolean;
}

const DisconnectedWallet = memo(
  ({ onClick, isLoading }: DisconnectedWalletProps) => (
    <Button variant="outline" onClick={onClick} disabled={isLoading}>
      {isLoading ? "Checking..." : "Connect Wallet"}
    </Button>
  ),
);
DisconnectedWallet.displayName = "DisconnectedWallet";

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
      if (activeWalletType === "starknet") {
        await disconnectStarknet();
        showToast("DISCONNECT", "success");
      } else if (activeWalletType === "privy") {
        await logoutFromPrivy();
        showToast("EVM_DISCONNECT", "success");
      }
    } catch {
      showToast("DEFAULT_ERROR", "error");
    }
  }, [activeWalletType, disconnectStarknet, logoutFromPrivy]);

  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address);
  }, []);

  if (starknetWallet.isConnected || privyAuthenticated) {
    const address = starknetWallet.address || privyAddress || "";
    const walletType = activeWalletType as "starknet" | "privy";

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
WalletButton.displayName = "WalletButton";
