import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/lib/wallet-context'
import { DepositModal } from './deposit-modal'

export function DepositButton() {
  const { walletType, isConnected } = useWallet()
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  console.log('DepositButton render:', { walletType, isConnected }) // Debug log

  // Only show for MetaMask connections
  if (!isConnected || walletType !== 'metamask') {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-r from-[#F76B2A] to-[#A047E4] text-white hover:opacity-90"
      >
        Deposit
      </Button>
      <DepositModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
} 