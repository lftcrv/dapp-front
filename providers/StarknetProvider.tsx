'use client';

import { InjectedConnector } from "starknetkit/injected";
import { ArgentMobileConnector, isInArgentMobileAppBrowser } from "starknetkit/argentMobile";
import { WebWalletConnector } from "starknetkit/webwallet";
import { mainnet, sepolia } from "@starknet-react/chains";
import { StarknetConfig, nethermindProvider, publicProvider } from "@starknet-react/core";
import { ReactNode } from "react";

export default function StarknetProvider({ children }: { children: ReactNode }) {
  const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN;
  const chains = defaultChain === sepolia.network ? [sepolia, mainnet] : [mainnet, sepolia];
  const nethermindApiKey = process.env.NEXT_PUBLIC_NETHERMIND_API_KEY;

  const connectors = isInArgentMobileAppBrowser() ? [
    ArgentMobileConnector.init({
      options: {
        dappName: "LeftCurve dApp",
        projectId: "leftcurve-dapp",
        url: "https://app.leftcurve.xyz",
      },
      inAppBrowserOptions: {},
    })
  ] : [
    new InjectedConnector({ options: { id: "braavos", name: "Braavos" }}),
    new InjectedConnector({ options: { id: "argentX", name: "Argent X" }}),
    new WebWalletConnector({ url: "https://web.argent.xyz" }),
    ArgentMobileConnector.init({
      options: {
        dappName: "LeftCurve dApp",
        projectId: "leftcurve-dapp",
        url: "https://app.leftcurve.xyz",
      },
    })
  ];

  const provider = nethermindApiKey ? 
    nethermindProvider({ 
      apiKey: nethermindApiKey
    }) : 
    publicProvider();

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