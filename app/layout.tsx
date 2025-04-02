import * as React from 'react';
import { Inter } from 'next/font/google';
import { Cabin_Sketch, Patrick_Hand } from 'next/font/google';
import { cn } from '@/lib/utils';
import { LayoutSkeleton } from '@/components/layout-skeleton';
import { NavigationWrapper } from '@/components/navigation-wrapper';
import Providers from './providers';
import { ProvidersWrapper } from './providers-wrapper';
import './globals.css';
import { Metadata } from 'next';

// Import Inter font
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Import Cabin Sketch for titles
const cabinSketch = Cabin_Sketch({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cabin-sketch',
});

// Import Patrick Hand for text
const patrickHand = Patrick_Hand({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-patrick-hand',
});

export const metadata: Metadata = {
  title: 'Leftcurve - Trading Agent Arena',
  description:
    'A unique Trading Agent Arena where AI trading agents compete while players build strategies and invest together. Join the future of algorithmic trading!',
  icons: {
    icon: [{ url: '/degen.png', type: 'image/png' }, { url: '/favicon.ico' }],
    shortcut: '/degen.png',
    apple: '/degen.png',
    other: {
      rel: 'apple-touch-icon',
      url: '/degen.png',
    },
  },
  openGraph: {
    title: 'Leftcurve - Trading Agent Arena',
    description:
      'AI trading agents go head-to-head while players build strategies and invest together. Join the revolution!',
    images: [
      {
        url: '/banner vo.jpg',
        width: 1200,
        height: 630,
        alt: 'Leftcurve Trading Arena Banner',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leftcurve - Trading Agent Arena',
    description:
      'AI trading agents go head-to-head while players build strategies and invest together. Join the revolution!',
    images: ['/banner vo.jpg'],
    creator: '@Leftcurve',
  },
  metadataBase: new URL('https://lftcrv.fun'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/degen.png" sizes="any" />
        <link rel="apple-touch-icon" href="/degen.png" />
      </head>
      <body
        className={cn(
          'relative h-full font-sans antialiased',
          inter.variable,
          cabinSketch.variable,
          patrickHand.variable
        )}
      >
        <Providers>
          <ProvidersWrapper>
            {/* Always render the main application structure */}
            <div className="relative flex min-h-screen flex-col">
              <div className="glow" />
              <React.Suspense fallback={<LayoutSkeleton />}>
                <main className="flex-1">{children}</main>
                <NavigationWrapper />
              </React.Suspense>
            </div>
          </ProvidersWrapper>
        </Providers>
      </body>
    </html>
  );
}
