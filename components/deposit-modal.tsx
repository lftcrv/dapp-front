'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { shortAddress } from '@/lib/utils';
import { useWallets } from '@privy-io/react-auth';
import { Input } from '@/components/ui/input';
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

interface WalletInfoProps {
  walletType: 'starknet' | 'evm';
  address: string;
  chainId?: number;
}

const WalletInfo = memo(({ walletType, address, chainId }: WalletInfoProps) => (
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
))
WalletInfo.displayName = 'WalletInfo'

interface TokenSelectProps {
  value: Token;
  onChange: (value: Token) => void;
}

const TokenSelect = memo(({ value, onChange }: TokenSelectProps) => {
  const selectedToken = useMemo(() => 
    TOKENS.find(t => t.id === value)
  , [value])

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Token</label>
      <Select
        value={value}
        onValueChange={(value) => onChange(value as Token)}
      >
        <SelectTrigger>
          <SelectValue>
            {selectedToken && (
              <span className="flex items-center gap-2">
                <span>{selectedToken.icon}</span>
                <span>{selectedToken.name}</span>
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
  )
})
TokenSelect.displayName = 'TokenSelect'

interface BridgeSelectProps {
  value: Bridge;
  onChange: (value: Bridge) => void;
}

const BridgeSelect = memo(({ value, onChange }: BridgeSelectProps) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium">Bridge</label>
    <Select
      value={value}
      onValueChange={(value) => onChange(value as Bridge)}
    >
      <SelectTrigger>
        <SelectValue>
          {BRIDGES.find(b => b.id === value)?.name}
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
))
BridgeSelect.displayName = 'BridgeSelect'

export const DepositModal = memo(({ isOpen, onClose, walletType, address }: DepositModalProps) => {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token>('eth');
  const [selectedBridge, setSelectedBridge] = useState<Bridge>('rhino');
  const { wallets } = useWallets();

  const currentWallet = useMemo(() => 
    wallets.find(w => w.address.toLowerCase() === address.toLowerCase())
  , [wallets, address])

  const chainId = currentWallet?.chainId ? Number(currentWallet.chainId) : undefined;
  const networkName = chainId && chainId in CHAIN_NAMES ? CHAIN_NAMES[chainId] : 'ETHEREUM';

  const handleBridge = useCallback(() => {
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
  }, [selectedBridge, amount, selectedToken, networkName, onClose]);

  const isValidAmount = useMemo(() => 
    amount && parseFloat(amount) > 0
  , [amount])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
          <DialogDescription>
            Choose your token and amount to deposit from {walletType === 'evm' ? 'EVM' : 'Starknet'} wallet {shortAddress(address)}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <WalletInfo 
            walletType={walletType}
            address={address}
            chainId={chainId}
          />

          <TokenSelect 
            value={selectedToken}
            onChange={setSelectedToken}
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <BridgeSelect 
            value={selectedBridge}
            onChange={setSelectedBridge}
          />

          <Button 
            onClick={handleBridge} 
            className="w-full"
            disabled={!isValidAmount}
          >
            Bridge to Starknet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
})
DepositModal.displayName = 'DepositModal' 