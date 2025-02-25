'use client';

import { InjectedConnector } from "starknetkit/injected";
import { WebWalletConnector } from "starknetkit/webwallet";
import { mainnet, sepolia } from "@starknet-react/chains";
import { StarknetConfig, publicProvider, useAccount, useConnect } from "@starknet-react/core";
import { ReactNode, useEffect } from "react";

function ConnectionStateMonitor() {
  const { address, isConnected, isReconnecting } = useAccount();
  const { connectors, pendingConnector } = useConnect();

  useEffect(() => {
    console.log('🔄 Starknet Connection State:', {
      isConnected,
      isReconnecting,
      address,
      availableConnectors: connectors.map(c => ({
        id: c.id,
        name: c.name,
        available: c.available()
      })),
      pendingConnector: pendingConnector?.id
    });
  }, [isConnected, isReconnecting, address, connectors, pendingConnector]);

  return null;
}

export default function StarknetProvider({ children }: { children: ReactNode }) {
  const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN;
  const chains = defaultChain === sepolia.network ? [sepolia, mainnet] : [mainnet, sepolia];

  console.log('📊 Starknet Provider Configuration:', {
    defaultChain,
    availableChains: chains.map(c => ({ id: c.id, name: c.name }))
  });

  const connectors = [
    new InjectedConnector({
      options: {
        id: 'braavos',
        name: 'Braavos'
      }
    }),
    new InjectedConnector({
      options: {
        id: 'argentX',
        name: 'Argent X'
      }
    }),
    new WebWalletConnector({
      url: 'https://web.argent.xyz'
    })
  ];

  useEffect(() => {
    const checkConnectors = async () => {
      const status = await Promise.all(
        connectors.map(async (c) => ({
          id: c.id,
          name: c.name,
          available: await c.available()
        }))
      );
      console.log('🔌 Connector Status:', status);
    };
    checkConnectors();
  }, [connectors]);

  const provider = publicProvider();
  console.log('🌐 Using public provider');

  return (
    <StarknetConfig
      chains={chains}
      provider={provider}
      connectors={connectors}
      autoConnect={true}
    >
      <ConnectionStateMonitor />
      {children}
    </StarknetConfig>
  );
} 