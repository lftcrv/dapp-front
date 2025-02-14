'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { wagmiConfig } from './wagmiConfig';

export default function Providers({ children }: { children: React.ReactNode }) {
  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

  React.useEffect(() => {
    if (!PRIVY_APP_ID) {
      console.error(
        "⚠️ NEXT_PUBLIC_PRIVY_APP_ID is not defined! Make sure it's set in your environment.",
      );
    }
  }, []);
  console.log("PRIVY_APP_ID", PRIVY_APP_ID)

  return (
    <QueryClientProvider client={new QueryClient()}>
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          appearance: {
            theme: 'dark',
            accentColor: '#676FFF',
            logo: '/degen.png',
            showWalletLoginFirst: true,
          },
          supportedChains: [mainnet, sepolia],
          loginMethods: [
            'wallet',
            'email',
            'google',
            'twitter',
            'discord',
            'github',
          ],
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          defaultChain: mainnet,
          walletConnectCloudProjectId:
            process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
        }}
      >
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}
