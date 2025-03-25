'use client';

import { type ReactNode } from 'react';
import { WalletProvider } from '@/app/context/wallet-context';
import StarknetProvider from '@/providers/StarknetProvider';
import { Toaster } from 'sonner';
import { BlurProvider } from '@/providers/BlurProvider';
import { BlurOverlay } from '@/components/referral/blur-overlay';
import { ReferralRequiredMessage } from '@/components/referral/referral-required-message';

export function ProvidersWrapper({ children }: { children: ReactNode }) {
  return (
    <StarknetProvider>
      <WalletProvider>
        <BlurProvider>
          <BlurOverlay>
            {children}
            <ReferralRequiredMessage />
            <Toaster position="bottom-right" theme="dark" />
          </BlurOverlay>
        </BlurProvider>
      </WalletProvider>
    </StarknetProvider>
  );
} 