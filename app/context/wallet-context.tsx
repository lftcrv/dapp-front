'use client'

import { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect, 
  useMemo,
  type ReactNode 
} from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { connect, disconnect } from 'starknetkit'
import { InjectedConnector } from 'starknetkit/injected'
import { type StarknetWindowObject, type AccountChangeEventHandler, type NetworkChangeEventHandler } from 'get-starknet-core'

interface StarknetWalletState {
  wallet: StarknetWindowObject | null
  address?: string
  isConnected: boolean
  chainId?: string
}

interface WalletContextType {
  // Starknet state
  starknetWallet: StarknetWalletState
  connectStarknet: () => Promise<void>
  disconnectStarknet: () => Promise<void>
  
  // Privy state
  privyReady: boolean
  privyAuthenticated: boolean
  privyAddress?: string
  loginWithPrivy: () => Promise<void>
  logoutFromPrivy: () => Promise<void>
  
  // Combined state
  isLoading: boolean
  activeWalletType: 'starknet' | 'privy' | null
  currentAddress?: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  // 1. All useState hooks
  const [isLoadingWallet, setIsLoadingWallet] = useState(false)
  const [isManuallyConnecting, setIsManuallyConnecting] = useState(false)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [starknetWallet, setStarknetWallet] = useState<StarknetWalletState>({
    wallet: null,
    isConnected: false
  })

  // 2. All external hooks
  const { 
    ready: privyReady, 
    authenticated: privyAuthenticated, 
    user,
    login,
    logout 
  } = usePrivy()

  // 3. All useCallback hooks
  const clearStarknetState = useCallback(() => {
    setStarknetWallet({
      wallet: null,
      isConnected: false
    })
    localStorage.removeItem('starknet_wallet')
    sessionStorage.removeItem('starknet_wallet_cache')
  }, [])

  const handleAccountsChanged = useCallback((accounts?: string[]) => {
    if (accounts?.[0] && accounts[0] !== starknetWallet.address) {
      setStarknetWallet(prev => ({
        ...prev,
        address: accounts[0]
      }))
    }
  }, [starknetWallet.address])

  const handleNetworkChanged = useCallback(async (chainId?: string, accounts?: string[]) => {
    setStarknetWallet(prev => ({
      ...prev,
      chainId: chainId || undefined,
      address: accounts?.[0] || prev.address
    }))
  }, [])

  const connectStarknet = useCallback(async () => {
    if (isLoadingWallet || privyAuthenticated || isConnectModalOpen) return
    
    setIsLoadingWallet(true)
    setIsManuallyConnecting(true)
    setIsConnectModalOpen(true)
    try {
      const connection = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "dark",
        dappName: "LeftCurve",
      })
      
      const { wallet, connectorData } = connection
      if (!wallet || !connectorData?.account) {
        clearStarknetState()
        return
      }

      // Get chain ID
      const chainId = await wallet.request({ 
        type: 'wallet_requestChainId' 
      }).catch(() => undefined)

      // Setup wallet event listeners
      wallet.on('accountsChanged', handleAccountsChanged)
      wallet.on('networkChanged', handleNetworkChanged)

      const walletState = {
        wallet,
        address: connectorData.account,
        chainId,
        isConnected: true
      }

      // Update state and storage
      setStarknetWallet(walletState)
      localStorage.setItem('starknet_wallet', JSON.stringify({ 
        address: connectorData.account, 
        chainId, 
        isConnected: true 
      }))
      sessionStorage.setItem('starknet_wallet_cache', JSON.stringify({
        timestamp: Date.now(),
        data: walletState
      }))

    } catch (err) {
      console.error('Failed to connect Starknet wallet:', err)
      clearStarknetState()
    } finally {
      setIsLoadingWallet(false)
      setIsManuallyConnecting(false)
      setIsConnectModalOpen(false)
    }
  }, [clearStarknetState, isLoadingWallet, privyAuthenticated, isConnectModalOpen, handleAccountsChanged, handleNetworkChanged])

  const disconnectStarknet = useCallback(async () => {
    try {
      // First remove event listeners if they exist
      if (starknetWallet.wallet?.off) {
        try {
          starknetWallet.wallet.off('accountsChanged', handleAccountsChanged)
          starknetWallet.wallet.off('networkChanged', handleNetworkChanged)
        } catch (err) {
          console.warn('Failed to remove wallet listeners:', err)
        }
      }

      // Then disconnect the wallet
      await disconnect({ clearLastWallet: true })
      
      // Finally clear the state
      clearStarknetState()
    } catch (err) {
      console.error('Failed to disconnect Starknet wallet:', err)
      // Still try to clear state even if disconnect fails
      clearStarknetState()
    }
  }, [clearStarknetState, starknetWallet.wallet, handleAccountsChanged, handleNetworkChanged])

  const loginWithPrivy = useCallback(async () => {
    if (!privyReady || privyAuthenticated) return
    try {
      await login()
    } catch (err) {
      console.error('Failed to login with Privy:', err)
    }
  }, [login, privyReady, privyAuthenticated])

  const logoutFromPrivy = useCallback(async () => {
    if (!privyAuthenticated) return
    try {
      await logout()
    } catch (err) {
      console.error('Failed to logout from Privy:', err)
    }
  }, [logout, privyAuthenticated])

  // 4. All useEffect hooks
  useEffect(() => {
    const checkStarknetConnection = async () => {
      if (isLoadingWallet || privyAuthenticated || isManuallyConnecting || isConnectModalOpen) return
      
      try {
        const cachedWallet = sessionStorage.getItem('starknet_wallet_cache')
        if (cachedWallet) {
          const { timestamp, data } = JSON.parse(cachedWallet)
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            setStarknetWallet(data)
            return
          }
        }

        const savedWallet = localStorage.getItem('starknet_wallet')
        if (!savedWallet) return

        const { address, chainId: savedChainId, isConnected } = JSON.parse(savedWallet)
        if (!isConnected) return

        const connection = await connect({
          modalMode: "neverAsk",
          modalTheme: "dark",
          dappName: "LeftCurve",
        })
        
        const { wallet, connectorData } = connection
        if (!wallet) {
          clearStarknetState()
          return
        }

        try {
          const currentChainId = await wallet.request({ 
            type: 'wallet_requestChainId' 
          })

          if (currentChainId !== savedChainId) {
            console.warn('Chain ID mismatch, reconnecting wallet')
          }

          const walletState = {
            wallet,
            address: connectorData?.account || address,
            chainId: currentChainId,
            isConnected: true
          }
          setStarknetWallet(walletState)
          sessionStorage.setItem('starknet_wallet_cache', JSON.stringify({
            timestamp: Date.now(),
            data: walletState
          }))

          wallet.on('accountsChanged', handleAccountsChanged)
          wallet.on('networkChanged', handleNetworkChanged)
        } catch {
          clearStarknetState()
        }
      } catch (err) {
        console.error('Failed to check Starknet connection:', err)
        clearStarknetState()
      }
    }

    checkStarknetConnection()
  }, [clearStarknetState, isLoadingWallet, privyAuthenticated, isManuallyConnecting, isConnectModalOpen, handleAccountsChanged, handleNetworkChanged])

  useEffect(() => {
    if (privyAuthenticated && starknetWallet.isConnected) {
      disconnectStarknet()
    }
  }, [privyAuthenticated, starknetWallet.isConnected, disconnectStarknet])

  useEffect(() => {
    return () => {
      if (starknetWallet.wallet?.off) {
        try {
          starknetWallet.wallet.off('accountsChanged', handleAccountsChanged)
          starknetWallet.wallet.off('networkChanged', handleNetworkChanged)
        } catch (err) {
          console.warn('Failed to remove wallet listeners:', err)
        }
      }
    }
  }, [starknetWallet.wallet, handleAccountsChanged, handleNetworkChanged])

  // 5. Final useMemo
  const value = useMemo((): WalletContextType => ({
    starknetWallet,
    connectStarknet,
    disconnectStarknet,
    privyReady,
    privyAuthenticated,
    privyAddress: user?.wallet?.address,
    loginWithPrivy,
    logoutFromPrivy,
    isLoading: isLoadingWallet || !privyReady,
    activeWalletType: starknetWallet.isConnected ? 'starknet' : privyAuthenticated ? 'privy' : null,
    currentAddress: starknetWallet.isConnected ? starknetWallet.address : user?.wallet?.address
  }), [
    starknetWallet,
    connectStarknet,
    disconnectStarknet,
    privyReady,
    privyAuthenticated,
    user?.wallet?.address,
    loginWithPrivy,
    logoutFromPrivy,
    isLoadingWallet
  ])

  return (
    <WalletContext.Provider value={value}>
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