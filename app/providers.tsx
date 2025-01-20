'use client'

import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { mainnet, sepolia } from 'viem/chains'
import { wagmiConfig } from './wagmiConfig'

// Ensure PRIVY_APP_ID is defined
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not defined')
}

// After the check above, we can safely assert this is defined
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
          logo: '/degen.png',
        },
        // Using proper chain type from Privy
        supportedChains: [
          mainnet,
          sepolia
        ],
        loginMethods: ['email', 'wallet'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          // Remove unsupported option
          // noPromptOnSignature: true,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
} 