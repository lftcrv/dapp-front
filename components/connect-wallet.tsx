'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export function ConnectWallet() {
  const { login, ready } = usePrivy()

  return (
    <Button 
      onClick={login} 
      disabled={!ready}
      variant="outline"
      size="sm"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  )
} 