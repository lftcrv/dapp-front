'use client'

import * as React from 'react'
import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig } from '@privy-io/wagmi'
import { mainnet } from 'viem/chains'
import { http } from 'viem'

const queryClient = new QueryClient()

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http()
  }
})

const privyConfig = {
  loginMethods: ['wallet'] as Array<'wallet'>,
  appearance: {
    theme: 'dark' as const,
    accentColor: '#F97316' as `#${string}`,
    showWalletLoginFirst: true,
  },
  supportedChains: [mainnet],
  defaultChain: mainnet,
  embeddedWallets: {
    createOnLogin: 'users-without-wallets' as const,
  },
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  // Disable third-party storage access
  storageAccessBehavior: {
    allowLocalStorage: true,
    allowSessionStorage: true,
    allowIndexedDB: false,
  },
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cm5xsjyf902mm5xx5c6oo3vyv"
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
} 