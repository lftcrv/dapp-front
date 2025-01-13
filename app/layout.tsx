import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NavigationMenu } from '@/components/navigation-menu'
import { WalletProvider } from '@/lib/wallet-context'
import './globals.css'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={cn("relative h-full font-sans antialiased", inter.className)}>
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
