'use client';

import { type ReactNode } from 'react';
import { WalletProvider } from '@/app/context/wallet-context';
import StarknetProvider from '@/providers/StarknetProvider';
import { Toaster } from 'sonner';
import { AccessGateProvider, useAccessGate } from '@/providers/AccessGateProvider';
import { useWallet } from '@/app/context/wallet-context';
import { CookieAuthManager } from '@/providers/CookieAuthManager';
import { AccessGateModal } from '@/components/access/AccessGateModal';

// Access management component that shows the modal when needed
function AccessGateController() {
  const { showAccessModal, setShowAccessModal } = useAccessGate();
  const { starknetWallet, privyAuthenticated, disconnectStarknet } = useWallet();
  const isConnected = starknetWallet.isConnected || privyAuthenticated;
  
  const handleClose = () => {
    disconnectStarknet();
    setShowAccessModal(false);
  };
  
  // Only show the blur overlay when not connected and no modal is showing
  const showBlurOverlay = !isConnected && !showAccessModal;
  
  return (
    <>
      {/* The main modal for both connection and access code entry */}
      {(showAccessModal || showBlurOverlay) && (
        <AccessGateModal 
          isConnected={isConnected} 
          onClose={handleClose} 
        />
      )}
    </>
  );
}

export function ProvidersWrapper({ children }: { children: ReactNode }) {
  return (
    <StarknetProvider>
      <WalletProvider>
        <CookieAuthManager>
          <AccessGateProvider> 
            {/* Main content always renders */}
            {children}
            
            {/* Unified access controller */}
            <AccessGateController />
            
            <Toaster position="bottom-right" theme="dark" />
          </AccessGateProvider>
        </CookieAuthManager>
      </WalletProvider>
    </StarknetProvider>
  );
} 