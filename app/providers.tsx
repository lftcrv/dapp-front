'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from '@privy-io/wagmi'
import { http } from 'wagmi'
import { mainnet, sepolia } from 'viem/chains'
import { createConfig } from '@privy-io/wagmi'
import { Toaster } from 'sonner'
import { WalletProvider } from '@/lib/wallet-context'

const queryClient = new QueryClient()

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
        },
        loginMethods: ['wallet'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <WalletProvider>
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
            {children}
          </WalletProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
} 