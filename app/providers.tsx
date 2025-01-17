'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider, createConfig } from '@privy-io/wagmi'
import { mainnet } from 'viem/chains'
import { http } from 'wagmi'

// Ensure PRIVY_APP_ID is defined
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error('NEXT_PUBLIC_PRIVY_APP_ID is not defined in environment variables')
}

// After the check above, we can safely assert this is defined
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID

const queryClient = new QueryClient()

const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http()
  }
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
        },
        supportedChains: [mainnet],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        }
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