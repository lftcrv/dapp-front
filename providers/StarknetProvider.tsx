'use client';

import { InjectedConnector } from "starknetkit/injected";
import { WebWalletConnector } from "starknetkit/webwallet";
import { mainnet, sepolia } from "@starknet-react/chains";
import { StarknetConfig, nethermindProvider } from "@starknet-react/core";
import { ReactNode } from "react";

export default function StarknetProvider({ children }: { children: ReactNode }) {
  const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN;
  const chains = defaultChain === 'sepolia' ? [sepolia, mainnet] : [mainnet, sepolia];
  const nethermindApiKey = process.env.NEXT_PUBLIC_NETHERMIND_API_KEY;

  if (!nethermindApiKey) {
    throw new Error('Missing Nethermind API key');
  }

  const connectors = [
    new InjectedConnector({ options: { id: "braavos", name: "Braavos" }}),
    new InjectedConnector({ options: { id: "argentX", name: "Argent X" }}),
    new WebWalletConnector({ url: "https://web.argent.xyz" }),
  ];

  // Configure provider with Nethermind RPC
  const provider = nethermindProvider({
    apiKey: nethermindApiKey,
  });

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