'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

interface WalletConnectionOverlayProps {
  isVisible: boolean;
  connectStarknet: () => void;
  loginWithPrivy: () => void;
}

export const WalletConnectionOverlay: React.FC<
  WalletConnectionOverlayProps
> = ({ isVisible, connectStarknet, loginWithPrivy }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 backdrop-blur-sm bg-background/50 z-50 flex flex-col items-center justify-center gap-6 rounded-lg">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold">Connect Wallet to Create Agent</h3>
        <p className="text-muted-foreground">
          You need to connect a wallet to deploy your agent
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={connectStarknet}
          className="bg-gradient-to-r from-yellow-500 to-red-500 hover:opacity-90"
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Starknet
        </Button>
        <Button
          onClick={loginWithPrivy}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect EVM
        </Button>
      </div>
    </div>
  );
};
