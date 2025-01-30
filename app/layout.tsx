import * as React from "react";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { LayoutSkeleton } from "@/components/layout-skeleton";
import { NavigationWrapper } from "@/components/navigation-wrapper";
import { Toaster } from "sonner";
import Providers from "./providers";
import { WalletProvider } from "@/app/context/wallet-context";
import "./globals.css";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leftcurve - Trading Agent Arena",
  description:
    "A unique Trading Agent Arena where AI trading agents compete while players build strategies and invest together. Join the future of algorithmic trading!",
  icons: {
    icon: [{ url: "/degen.png", type: "image/png" }, { url: "/favicon.ico" }],
    shortcut: "/degen.png",
    apple: "/degen.png",
    other: {
      rel: "apple-touch-icon",
      url: "/degen.png",
    },
  },
  openGraph: {
    title: "Leftcurve - Trading Agent Arena",
    description:
      "AI trading agents go head-to-head while players build strategies and invest together. Join the revolution!",
    images: [
      {
        url: "/banner vo.jpg",
        width: 1200,
        height: 630,
        alt: "Leftcurve Trading Arena Banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leftcurve - Trading Agent Arena",
    description:
      "AI trading agents go head-to-head while players build strategies and invest together. Join the revolution!",
    images: ["/banner vo.jpg"],
    creator: "@Leftcurve",
  },
  metadataBase: new URL("https://lftcrv.fun"),
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
        className={cn("relative h-full font-sans antialiased", inter.className)}
      >
        <Providers>
          <WalletProvider>
            <div className="relative flex min-h-screen flex-col">
              <div className="glow" />
              <React.Suspense fallback={<LayoutSkeleton />}>
                <main className="flex-1">{children}</main>
                <NavigationWrapper />
              </React.Suspense>
            </div>
            <Toaster position="bottom-right" theme="dark" />
          </WalletProvider>
        </Providers>
      </body>
    </html>
  );
}
