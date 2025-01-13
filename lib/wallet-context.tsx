'use client'

import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from 'react'
import { connect, disconnect } from 'starknetkit'
import { useToast } from "@/hooks/use-toast"
import { shortAddress } from '@/lib/utils'

interface WalletContextType {
  address: string
  isConnecting: boolean
  isConnected: boolean
  walletType: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

interface ConnectResult {
  connector?: {
    _wallet?: {
      id?: string
    }
  }
  connectorData?: {
    account?: string
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string>('')
  const [walletType, setWalletType] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  const connectWallet = useCallback(async () => {
    console.log("🦧 Connecting wallet...")
    setIsConnecting(true)
    try {
      const result = await connect({
        modalMode: 'alwaysAsk',
        dappName: 'LeftCurve',
      }) as ConnectResult

      if (result?.connectorData?.account) {
        setAddress(result.connectorData.account)
        setWalletType(result.connector?._wallet?.id || null)
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${shortAddress(result.connectorData.account)}`,
        })
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsConnecting(false)
    }
  }, [toast])

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect()
      setAddress('')
      setWalletType(null)
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected.',
      })
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }, [toast])

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected: !!address,
        walletType,
        connect: connectWallet,
        disconnect: disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
} 