'use client'

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { connect, disconnect } from 'starknetkit'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { shortAddress } from '@/lib/utils'
import { showToast } from '@/lib/toast-config'
import { WalletModal } from '@/components/wallet-modal'

interface WalletContextType {
  address: string
  isConnecting: boolean
  isConnected: boolean
  walletType: string | null
  connect: () => void
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasShownConnectToast, setHasShownConnectToast] = useState(false)

  // Wagmi hooks
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { address: ethAddress, isConnected: isEthConnected } = useAccount()

  // Handle wagmi connection state changes
  useEffect(() => {
    if (isEthConnected && ethAddress && !hasShownConnectToast) {
      setHasShownConnectToast(true)
      showToast.leftcurve(
        "Connected to MetaMask",
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">Account</span>
            <span className="font-mono text-sm">{shortAddress(ethAddress)}</span>
          </div>
          <div className="text-sm text-gray-500">
            Select "Disconnect wallet" to use a different wallet
          </div>
        </div>
      )
    } else if (!isEthConnected && hasShownConnectToast) {
      setHasShownConnectToast(false)
    }
  }, [isEthConnected, ethAddress, hasShownConnectToast])

  const connectStarknet = async () => {
    console.log("🦧 Connecting StarkNet...")
    if (isConnecting) return // Prevent multiple connection attempts
    
    setIsConnecting(true)
    try {
      // If MetaMask is connected, disconnect it first
      if (isEthConnected) {
        console.log("Disconnecting MetaMask first...")
        await disconnectAsync()
      }

      // Always clean up previous state before new connection
      if (walletType) {
        console.log("Cleaning up previous wallet state...")
        
        // First reset the state
        setAddress('')
        setWalletType(null)
        
        // Then disconnect if it's a StarkNet wallet
        if (walletType === 'starknet') {
          try {
            await disconnect()
          } catch (e) {
            console.log("Disconnect error (expected):", e)
          }
        }

        // Wait for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      // Close our custom modal first before opening starknetkit's modal
      setIsModalOpen(false)
      
      // Wait a bit before trying to connect
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = await connect({
        modalMode: 'alwaysAsk',
        dappName: 'LeftCurve',
      })

      console.log("StarkNet connection result:", result)

      // If user cancelled or closed the modal
      if (!result || !result.wallet) {
        console.log("Connection cancelled or no wallet selected")
        return
      }

      // Try to get the account
      try {
        // Wait a bit before enabling
        await new Promise(resolve => setTimeout(resolve, 500))
        
        await result.wallet.enable() // Enable the wallet first
        
        // Wait a bit after enabling
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Get the account address after enabling
        const address = result.wallet.account?.address
        if (!address) {
          throw new Error('No account found')
        }

        console.log("Got StarkNet address:", address)
        setAddress(address)
        setWalletType(result.wallet.name || 'starknet')
        showToast.leftcurve(
          "WAGMI DETECTED",
          <div className="flex items-center gap-2">
            <span>BASED STARKNET DEGEN</span>
            <span className="font-mono">{shortAddress(address)}</span>
            <span>APED IN SER</span>
          </div>
        )
      } catch (enableError) {
        console.error("Enable error:", enableError)
        if (enableError instanceof Error && enableError.message?.includes('reject')) {
          console.log("User rejected the connection")
          return
        }
        throw enableError
      }
    } catch (error) {
      console.error('Error connecting StarkNet:', error)
      const errorMessage = error instanceof Error ? error.message : 'Connection failed'
      
      // Don't show error toast for user rejections
      if (!errorMessage.toLowerCase().includes('reject')) {
        showToast.error(
          "NGMI MOMENT",
          <div className="flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const handleConnectMetamask = async () => {
    console.log("🦧 Connecting MetaMask...")
    if (isConnecting) {
      console.log("Connection already in progress...")
      return
    }
    
    setIsConnecting(true)
    try {
      // If StarkNet is connected, disconnect it first
      if (walletType === 'starknet') {
        console.log("Disconnecting StarkNet first...")
        await disconnect()
        setAddress('')
        setWalletType(null)
      }

      // Close our modal first
      setIsModalOpen(false)

      // Check if already connected
      if (isEthConnected && ethAddress) {
        setAddress(ethAddress)
        setWalletType('metamask')
        return
      }

      const result = await connectAsync({
        connector: injected()
      })

      if (!result?.accounts?.[0]) {
        throw new Error('No account found')
      }

      setAddress(result.accounts[0])
      setWalletType('metamask')
      showToast.leftcurve(
        "WAGMI DETECTED",
        <div className="flex items-center gap-2 text-xs">
          <span>BASED METAMASK DEGEN</span>
          <span className="font-mono">{shortAddress(result.accounts[0])}</span>
          <span>APED IN SER</span>
        </div>
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'METAMASK CONNECTION RUGGED SER'
      console.error('Error connecting MetaMask:', errorMessage)
      showToast.error(
        "NGMI MOMENT",
        <div className="flex items-center gap-2">
          <span>{errorMessage}</span>
        </div>
      )
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = useCallback(async () => {
    try {
      if (walletType === 'metamask') {
        await disconnectAsync()
      } else {
        await disconnect()
      }
      setAddress('')
      setWalletType(null)
      showToast.rightcurve(
        "PAPER HANDS",
        <div className="flex items-center gap-2">
          <span>BYE MIDCURVER</span>
        </div>
      )
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }, [walletType, disconnectAsync])

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected: !!address,
        walletType,
        connect: () => setIsModalOpen(true),
        disconnect: disconnectWallet,
      }}
    >
      {children}
      <WalletModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnectStarknet={connectStarknet}
        onConnectMetamask={handleConnectMetamask}
      />
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