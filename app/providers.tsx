'use client'

import { WagmiConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi-config'
import { WalletProvider } from '@/lib/wallet-context'
import { Toaster } from 'sonner'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
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
        <WalletProvider>
          {children}
        </WalletProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
} 