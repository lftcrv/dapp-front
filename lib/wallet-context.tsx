'use client'

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { connect, disconnect } from 'starknetkit'
import { useToast } from "@/hooks/use-toast"
import { shortAddress } from '@/lib/utils'

interface WalletContextType {
  address: string
  isConnecting: boolean
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

      console.log("Connection result:", result)

      if (result?.connectorData?.account) {
        const addr = result.connectorData.account
        const wallet = result.connector?._wallet?.id || 'Unknown'
        setAddress(addr)
        setWalletType(wallet)
        console.log("🚀 Connected to address:", addr, "with wallet:", wallet)
        toast({
          title: `${wallet === 'braavos' ? '🦧' : '🔵'} Wallet Connected`,
          description: `GM fren! Connected to ${shortAddress(addr)}`,
          className: "bg-green-500/10 text-green-500 border-green-500/20",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast({
        title: "❌ Connection Failed",
        description: "Could not connect to wallet. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
    setIsConnecting(false)
  }, [toast])

  const disconnectWallet = useCallback(async () => {
    console.log("👋 Disconnecting wallet...")
    await disconnect()
    setAddress('')
    setWalletType(null)
    toast({
      title: "👋 Wallet Disconnected",
      description: "Successfully disconnected wallet",
      className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      duration: 5000,
    })
  }, [toast])

  useEffect(() => {
    const checkConnection = async () => {
      console.log("🔍 Checking existing connection...")
      const result = await connect({
        modalMode: 'neverAsk',
        dappName: 'LeftCurve',
      }) as ConnectResult

      console.log("Check connection result:", result)

      if (result?.connectorData?.account) {
        const addr = result.connectorData.account
        const wallet = result.connector?._wallet?.id || 'Unknown'
        setAddress(addr)
        setWalletType(wallet)
        console.log("🔄 Reconnected to address:", addr, "with wallet:", wallet)
        toast({
          title: `${wallet === 'braavos' ? '🦧' : '🔵'} Welcome Back!`,
          description: `Connected to ${shortAddress(addr)}`,
          className: "bg-green-500/10 text-green-500 border-green-500/20",
          duration: 5000,
        })
      }
    }
    checkConnection()
  }, [toast])

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
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