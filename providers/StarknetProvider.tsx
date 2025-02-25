'use client';
import { InjectedConnector } from 'starknetkit/injected';
import { WebWalletConnector } from 'starknetkit/webwallet';
import { mainnet, sepolia } from '@starknet-react/chains';
import {
  StarknetConfig,
  jsonRpcProvider,
  publicProvider,
} from '@starknet-react/core';
import { ReactNode } from 'react';

export default function StarknetProvider({
  children,
}: {
  children: ReactNode;
}) {
  const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN;
  const chains =
    defaultChain === sepolia.network ? [sepolia, mainnet] : [mainnet, sepolia];
  const connectors = [
    new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
    new InjectedConnector({ options: { id: 'argentX', name: 'Argent X' } }),
    new WebWalletConnector({ url: 'https://web.argent.xyz' }),
  ];

  const PRIVATE_RPC_URL = process.env.NEXT_PUBLIC_STARKNET_RPC_URL;

  const provider = jsonRpcProvider({
    rpc: (chain) => ({
      nodeUrl: PRIVATE_RPC_URL,
    }),
  });

  console.log("rpcUrl:", PRIVATE_RPC_URL)

  console.log('chains:', chains);

  return (
    <StarknetConfig
      chains={chains}
      provider={provider}
      connectors={connectors}
      autoConnect={true}
    >
      {children}
    </StarknetConfig>
  );
}
