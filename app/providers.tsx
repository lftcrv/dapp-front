'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'
import { Toaster } from 'sonner'
import { wagmiConfig } from '@/lib/wagmi-config'
import { mainnet, sepolia } from 'viem/chains'
import { WalletProvider } from '@/lib/wallet-context'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#FF5733',
          logo: '/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        defaultChain: mainnet,
        supportedChains: [mainnet, sepolia],
        loginMethods: ['wallet'],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <WalletProvider>
            {children}
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "rgba(0, 0, 0, 0.9)",
                  color: "white",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  fontFamily: "monospace",
                  boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
                  borderRadius: "8px"
                },
                className: "font-mono",
                duration: 4000,
                unstyled: true
              }}
              closeButton
            />
          </WalletProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
} 