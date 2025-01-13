'use client'

import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from 'react'
import { connect, disconnect } from 'starknetkit'
import { shortAddress } from '@/lib/utils'
import { showToast } from '@/lib/toast-config'

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
        showToast.leftcurve(
          "🚀 WAGMI DETECTED",
          `based wallet ${shortAddress(result.connectorData.account)} just aped in`
        )
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      showToast.error(
        "💀 NGMI MOMENT",
        "wallet connection rugged ser"
      )
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect()
      setAddress('')
      setWalletType(null)
      showToast.rightcurve(
        "😴 PAPER HANDS",
        "bye ngmi fr fr"
      )
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }, [])

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