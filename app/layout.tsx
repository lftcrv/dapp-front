import * as React from 'react'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import { LayoutSkeleton } from '@/components/layout-skeleton'
import { PerformanceMonitor } from '@/components/performance-monitor'
import { NavigationWrapper } from '@/components/navigation-wrapper'
import Providers from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'),
  title: 'LeftCurve',
  description: 'Decentralized Agents',
  other: {
    'preload': [
      { as: 'script', href: '/main-app.js' },
      { as: 'style', href: '/globals.css' }
    ]
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
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
          <PerformanceMonitor />
          <div className="relative flex min-h-screen flex-col">
            <div className="glow" />
            {/* Show skeleton while main content loads */}
            <React.Suspense fallback={<LayoutSkeleton />}>
              <main className="flex-1">
                {children}
              </main>
              {/* Load navigation last */}
              <NavigationWrapper />
            </React.Suspense>
          </div>
        </Providers>
      </body>
    </html>
  )
}
