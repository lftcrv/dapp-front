'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { memo, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

const ConnectWallet = memo(() => {
  const { login, ready } = usePrivy()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = useCallback(async () => {
    setIsLoading(true)
    try {
      await login()
    } finally {
      setIsLoading(false)
    }
  }, [login])

  return (
    <Button 
      onClick={handleLogin} 
      disabled={!ready || isLoading}
      variant="outline"
      size="sm"
      className="relative"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      Connect Wallet
    </Button>
  )
})
ConnectWallet.displayName = 'ConnectWallet'

export { ConnectWallet } 