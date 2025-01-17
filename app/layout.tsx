import * as React from 'react'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import { LayoutSkeleton } from '@/components/layout-skeleton'
import { NavigationWrapper } from '@/components/navigation-wrapper'
import { Toaster } from 'sonner'
import Providers from './providers'
import { WalletProvider } from '@/lib/wallet-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LeftCurve',
  description: 'Decentralized Agents'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("relative h-full font-sans antialiased", inter.className)}>
        <Providers>
          <WalletProvider>
            <div className="relative flex min-h-screen flex-col">
              <div className="glow" />
              <React.Suspense fallback={<LayoutSkeleton />}>
                <main className="flex-1">
                  {children}
                </main>
                <NavigationWrapper />
              </React.Suspense>
            </div>
            <Toaster position="bottom-right" theme="dark" />
          </WalletProvider>
        </Providers>
      </body>
    </html>
  )
}
