import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { NavigationMenu } from '@/components/navigation-menu'
import { WalletProvider } from '@/lib/wallet-context'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'LeftCurve - Trading Agent Arena',
  description: 'Create, trade, and compete with AI trading agents powered by memes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={cn("relative h-full font-sans antialiased", GeistSans.className)}>
        <Toaster />
        <WalletProvider>
          <div className="relative flex min-h-screen flex-col">
            <div className="glow" />
            <NavigationMenu />
            <main className="flex-1 flex-grow">{children}</main>
          </div>
        </WalletProvider>
      </body>
    </html>
  )
}
