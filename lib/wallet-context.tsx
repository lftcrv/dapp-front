'use client'

import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { connect as connectStarknet, disconnect } from 'starknetkit'
import { useConnect, useDisconnect, useAccount } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { shortAddress } from '@/lib/utils'
import { showToast } from '@/lib/toast-config'
import { WalletModal } from '@/components/wallet-modal'

// Add StarkNet types
interface StarknetWallet {
  enable: () => Promise<void>
  account?: {
    address: string
  }
}

interface StarknetResult {
  wallet?: StarknetWallet
}

interface WalletContextType {
  address: string
  isConnecting: boolean
  isConnected: boolean
  walletType: string | null
  connect: () => void
  disconnect: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string>('')
  const [walletType, setWalletType] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Wagmi hooks
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { address: ethAddress, isConnected: isEthConnected } = useAccount()

  // Debug log for initial state
  console.log('WalletProvider state:', { address, walletType, isConnecting, ethAddress, isEthConnected })

  // Sync MetaMask connection state
  useEffect(() => {
    const syncMetaMaskState = async () => {
      console.log('Syncing MetaMask state:', { isEthConnected, ethAddress, walletType })
      try {
        if (isEthConnected && ethAddress) {
          console.log('Setting MetaMask connection:', ethAddress)
          setAddress(ethAddress)
          setWalletType('metamask')
        } else if (!isEthConnected && walletType === 'metamask') {
          // If MetaMask disconnected externally
          console.log('MetaMask disconnected externally')
          setAddress('')
          setWalletType(null)
        }
      } catch (error) {
        // Ignore authorization errors
        if (error instanceof Error && error.message?.includes('not been authorized')) {
          return
        }
        console.error('Error syncing MetaMask state:', error)
      }
    }

    syncMetaMaskState()
  }, [isEthConnected, ethAddress, walletType])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (walletType === 'metamask') {
        try {
          // Don't await the disconnect - just fire and forget on cleanup
          disconnectAsync().catch(() => {
            // Ignore any errors during cleanup
          })
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, [walletType])

  // Clean up Starknet state
  const cleanupStarknet = async () => {
    try {
      // First try to disconnect
      await disconnect()
    } catch (e) {
      console.log("StarkNet disconnect error (expected):", e)
    } finally {
      // Always clear state, even if disconnect fails
      setAddress('')
      setWalletType(null)
      setIsConnecting(false)
      setIsModalOpen(false)
      
      // Force a delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const disconnectWallet = useCallback(async () => {
    try {
      if (walletType === 'metamask') {
        // First reset the state to ensure UI updates immediately
        setAddress('')
        setWalletType(null)
        
        try {
          await disconnectAsync()
        } catch (e) {
          // Ignore MetaMask disconnect errors as they're usually UI-related
          console.log("MetaMask disconnect error (expected):", e)
        }
      } else if (walletType === 'starknet') {
        await cleanupStarknet()
      }

      showToast.rightcurve(
        "PAPER HANDS",
        <div className="flex items-center gap-2">
          <span>BYE MIDCURVER</span>
        </div>
      )
    } catch (error) {
      console.error('Error in disconnect flow:', error)
      // Even if there's an error, ensure the state is reset
      await cleanupStarknet()
    }
  }, [walletType])

  const connectStarknetWallet = async () => {
    console.log("🦧 Connecting StarkNet...")
    if (isConnecting) {
      console.log("Connection already in progress...")
      return
    }
    
    try {
      setIsConnecting(true)
      setIsModalOpen(false) // Close modal first

      // Ensure we're starting fresh
      await cleanupStarknet()

      // Try to connect to Starknet
      const result = await connectStarknet({
        modalMode: 'alwaysAsk',
        dappName: 'LeftCurve',
      }) as StarknetResult

      console.log("StarkNet connection result:", result)

      // If user cancelled or closed the modal
      if (!result?.wallet) {
        console.log("Connection cancelled or no wallet selected")
        return
      }

      try {
        // Wait for wallet to be enabled
        await result.wallet.enable()

        // Get the account address
        const starkAddress = result.wallet.account?.address
        if (!starkAddress) {
          throw new Error('No account found')
        }

        // Set state only after we have everything we need
        console.log("Got StarkNet address:", starkAddress)
        setAddress(starkAddress)
        setWalletType('starknet')
        
        showToast.leftcurve(
          "WAGMI DETECTED",
          <div className="flex items-center gap-2">
            <span>BASED STARKNET DEGEN</span>
            <span className="font-mono">{shortAddress(starkAddress)}</span>
            <span>APED IN SER</span>
          </div>
        )
      } catch (enableError) {
        console.log("Error enabling wallet:", enableError)
        await cleanupStarknet()
        throw enableError
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (!errorMessage.toLowerCase().includes('reject')) {
        console.error('Error connecting StarkNet:', error)
      }
      // Always cleanup on any error
      await cleanupStarknet()
    } finally {
      setIsConnecting(false)
    }
  }

  // Handle MetaMask connection flow
  const handleMetaMaskConnection = async () => {
    console.log("🦧 Connecting MetaMask...")
    if (isConnecting) {
      console.log("Connection already in progress...")
      return
    }
    
    setIsConnecting(true)
    setIsModalOpen(false) // Close modal first

    try {
      // Reset state before attempting new connection
      setAddress('')
      setWalletType(null)

      // Connect using wagmi
      const result = await connectAsync({
        connector: injected()
      })

      if (result?.accounts?.[0]) {
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
      }
    } catch (error: unknown) {
      // Reset state on error
      setAddress('')
      setWalletType(null)
      
      // Only log non-rejection errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (!errorMessage.toLowerCase().includes('reject') && !errorMessage.includes('not been authorized')) {
        console.error('Error connecting MetaMask:', error)
      }
    } finally {
      setIsConnecting(false)
    }
  }

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
        onConnectStarknet={connectStarknetWallet}
        onConnectMetamask={handleMetaMaskConnection}
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