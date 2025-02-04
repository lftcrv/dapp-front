'use client';

import { type ReactNode } from 'react';
import { WalletProvider } from '@/app/context/wallet-context';
import StarknetProvider from '@/providers/StarknetProvider';
import { Toaster } from 'sonner';

export function ProvidersWrapper({ children }: { children: ReactNode }) {
  return (
    <StarknetProvider>
      <WalletProvider>
        {children}
        <Toaster position="bottom-right" theme="dark" />
      </WalletProvider>
    </StarknetProvider>
  );
} 