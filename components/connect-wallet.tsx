'use client'

import * as React from 'react'
import { useWallet } from '@/lib/wallet-context'
import { Button } from '@/components/ui/button'
import { truncateAddress } from '@/lib/utils'
import { MetaMaskModal } from './metamask-modal'

export function ConnectWallet() {
  const {
    address,
    isConnecting,
    connect,
    disconnect,
    walletType,
    showMetaMaskTerms,
    setShowMetaMaskTerms,
    onMetaMaskTermsAccepted,
  } = useWallet()

  if (address) {
    return (
      <Button variant="outline" onClick={disconnect} className="font-medium">
        {truncateAddress(address)}
      </Button>
    )
  }

  return (
    <>
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-[#F76B2A] to-[#A047E4] text-white hover:opacity-90"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      <MetaMaskModal
        isOpen={showMetaMaskTerms}
        onClose={() => setShowMetaMaskTerms(false)}
        onContinue={onMetaMaskTermsAccepted}
        onDisconnect={disconnect}
      />
    </>
  )
} 