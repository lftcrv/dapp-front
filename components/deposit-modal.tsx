'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useState } from 'react';
import { shortAddress } from '@/lib/utils';
import { useWallets } from '@privy-io/react-auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletType: 'starknet' | 'evm';
  address: string;
}

const TOKENS = [
  { id: 'eth', name: 'ETH', icon: '⟠' },
  { id: 'usdc', name: 'USDC', icon: '💵' },
  { id: 'usdt', name: 'USDT', icon: '💵' },
  { id: 'dai', name: 'DAI', icon: '💵' },
] as const;

// Map chain IDs to network names used by bridges
const CHAIN_NAMES: Record<number, string> = {
  1: 'ETHEREUM',
  42161: 'ARBITRUM',
  10: 'OPTIMISM',
  137: 'POLYGON',
} as const;

const BRIDGES = [
  {
    id: 'rhino',
    name: 'Rhino.fi',
    url: (params: { token: string; amount: string; sourceChain: string }) =>
      `https://app.rhino.fi/bridge?token=${params.token.toUpperCase()}&amount=${params.amount}&chainId=1&destChainId=SN_MAIN&chain=${params.sourceChain}&chainOut=STARKNET`,
  },
  {
    id: 'layerswap',
    name: 'LayerSwap',
    url: (params: { token: string; amount: string; sourceChain: string }) =>
      `https://www.layerswap.io/?destNetwork=STARKNET&sourceNetwork=${params.sourceChain}&asset=${params.token.toUpperCase()}&amount=${params.amount}`,
  },
  {
    id: 'starkgate',
    name: 'StarkGate',
    url: () => `https://starkgate.starknet.io/`,
  },
] as const;

type Token = typeof TOKENS[number]['id'];
type Bridge = typeof BRIDGES[number]['id'];

export function DepositModal({ isOpen, onClose, walletType, address }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token>('eth');
  const [selectedBridge, setSelectedBridge] = useState<Bridge>('rhino');
  const { wallets } = useWallets();

  // Get the current chain of the connected EVM wallet
  const currentWallet = wallets.find(w => w.address.toLowerCase() === address.toLowerCase());
  const chainId = currentWallet?.chainId ? Number(currentWallet.chainId) : undefined;
  const networkName = chainId && chainId in CHAIN_NAMES ? CHAIN_NAMES[chainId] : 'ETHEREUM';

  const handleBridge = () => {
    const bridge = BRIDGES.find(b => b.id === selectedBridge);
    if (bridge && amount && parseFloat(amount) > 0) {
      window.open(
        bridge.url({ 
          token: selectedToken, 
          amount,
          sourceChain: networkName
        }), 
        '_blank'
      );
      onClose();
    }
  };

  const selectedTokenData = TOKENS.find(t => t.id === selectedToken);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bridge to Starknet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Connected Wallet</label>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-mono">
                {walletType === 'starknet' ? (
                  <span>🌟 Starknet: {shortAddress(address)}</span>
                ) : (
                  <span>⚡️ EVM: {shortAddress(address)}</span>
                )}
              </div>
              {walletType === 'evm' && chainId && (
                <div className="text-xs text-muted-foreground">
                  Network: {CHAIN_NAMES[chainId] || 'Unknown'}
                </div>
              )}
            </div>
          </div>

          {/* Token Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Token</label>
            <Select
              value={selectedToken}
              onValueChange={(value) => setSelectedToken(value as Token)}
            >
              <SelectTrigger>
                <SelectValue>
                  {selectedTokenData && (
                    <span className="flex items-center gap-2">
                      <span>{selectedTokenData.icon}</span>
                      <span>{selectedTokenData.name}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map((token) => (
                  <SelectItem 
                    key={token.id} 
                    value={token.id}
                  >
                    <span className="flex items-center gap-2">
                      <span>{token.icon}</span>
                      <span>{token.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Bridge Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Bridge</label>
            <Select
              value={selectedBridge}
              onValueChange={(value) => setSelectedBridge(value as Bridge)}
            >
              <SelectTrigger>
                <SelectValue>
                  {BRIDGES.find(b => b.id === selectedBridge)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BRIDGES.map((bridge) => (
                  <SelectItem 
                    key={bridge.id} 
                    value={bridge.id}
                  >
                    {bridge.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleBridge} 
            className="w-full"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Bridge to Starknet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 