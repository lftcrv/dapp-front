import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NavigationMenu } from '@/components/navigation-menu'
import { Providers } from './providers'
import './globals.css'
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
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="glow" />
            <NavigationMenu />
            <main className="flex-1 flex-grow">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
