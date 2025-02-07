# Starknet Account Initialization Implementation Guide

Based on our codebase implementation, here are the specific solutions to the account initialization issues:

## 1. Provider Setup and Configuration

The key to preventing account initialization issues is proper provider setup:

```typescript
function StarknetProvider({ children }: { children: ReactNode }) {
  const chains = [mainnet, sepolia];
  
  const connectors = useMemo(() => [
    new InjectedConnector({ options: { id: 'braavos' }}),
    new InjectedConnector({ options: { id: 'argentX' }}),
  ], []);

  return (
    <StarknetConfig
      chains={chains}
      provider={nethermindProvider({ 
        apiKey: process.env.NEXT_PUBLIC_NETHERMIND_API_KEY,
        // Critical: These options ensure proper account initialization
        blockIdentifier: 'pending',
        chainId: chain.id 
      })}
      connectors={connectors}
      autoConnect={true} // Essential for proper initialization
    >
      {children}
    </StarknetConfig>
  );
}
```

### Key Configuration Points:
- `autoConnect: true` is crucial for proper initialization
- Proper chain configuration with `blockIdentifier` and `chainId`
- Correctly initialized connectors with proper IDs

## 2. Account State Synchronization

We handle the timing between wallet connection and account availability using a dedicated hook:

```typescript
function useWalletConnection() {
  const { connect } = useConnect();
  const { account, address, status } = useAccount();
  const [isInitializing, setIsInitializing] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);

  // Track wallet connection
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const isConnected = await window.starknet?.isConnected();
        setWalletConnected(!!isConnected);
      } catch (err) {
        console.error('Error checking wallet connection:', err);
        setWalletConnected(false);
      }
    };

    checkWallet();
    // Optional: Set up wallet change listener
    window.starknet?.on('accountsChanged', checkWallet);
    return () => {
      window.starknet?.off('accountsChanged', checkWallet);
    };
  }, []);

  // Important: Check BOTH wallet connection AND account
  const isReady = useMemo(() => {
    return walletConnected && // Wallet is connected
           status === 'connected' && // Starknet status is connected
           !!account && // Account object exists
           !!address; // Address is available
  }, [walletConnected, status, account, address]);

  return {
    isReady,
    isInitializing,
    walletConnected,
    account,
    address,
    status
  };
}
```

### Key Synchronization Points:
- Track initialization state
- Check both connection status and account existence
- Provide clear ready state indicator

## 3. Transaction Flow with Account State Handling

Our transaction hook properly handles the case where the wallet is connected but the account isn't ready:

```typescript
function useTransaction() {
  const { account, address, status } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const executeTransaction = useCallback(async (
    transaction: () => Promise<any>
  ) => {
    // Verify both status and account before proceeding
    if (status !== 'connected') {
      throw new Error('Wallet not connected');
    }

    if (!account || !address) {
      throw new Error('Account not initialized');
    }

    setIsProcessing(true);
    try {
      return await transaction();
    } finally {
      setIsProcessing(false);
    }
  }, [account, address, status]);

  return { executeTransaction, isProcessing };
}
```

### Key Transaction Points:
- Verify account state before each transaction
- Handle loading states properly
- Clear error handling

## 4. Error Recovery Implementation

We implement a robust recovery mechanism for handling "Account not initialized" errors:

```typescript
function useAccountWithRecovery() {
  const { account, address, status } = useAccount();
  const { connect } = useConnect();
  const [isRecovering, setIsRecovering] = useState(false);

  const recoverAccount = async () => {
    setIsRecovering(true);
    try {
      await connect();
      // Wait for account initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!account || !address) {
        throw new Error('Account recovery failed');
      }
    } finally {
      setIsRecovering(false);
    }
  };

  const executeWithRecovery = async (transaction: () => Promise<any>) => {
    try {
      return await transaction();
    } catch (err) {
      if (err.message === 'Account not initialized') {
        await recoverAccount();
        return await transaction();
      }
      throw err;
    }
  };

  return { executeWithRecovery, isRecovering };
}
```

### Key Recovery Points:
- Automatic reconnection attempt
- Proper error handling
- Transaction retry mechanism

## Usage Example

Here's how to put it all together:

```typescript
function SwapComponent() {
  const { isReady, account } = useWalletConnection();
  const { executeWithRecovery, isRecovering } = useAccountWithRecovery();
  const { executeTransaction, isProcessing } = useTransaction();

  const handleSwap = async () => {
    if (!isReady) {
      console.error('Account not ready');
      return;
    }

    try {
      await executeWithRecovery(async () => {
        await executeTransaction(async () => {
          // Your swap logic here
          await contract.invoke('swap', [params]);
        });
      });
    } catch (err) {
      console.error('Swap failed:', err);
    }
  };

  return (
    <button 
      onClick={handleSwap}
      disabled={isRecovering || isProcessing || !isReady}
    >
      {isRecovering ? 'Recovering...' : 
       isProcessing ? 'Processing...' : 
       'Swap'}
    </button>
  );
}
```

## Best Practices Summary

1. **Provider Configuration**
   - Always enable `autoConnect`
   - Configure proper chain settings
   - Initialize connectors correctly

2. **Account State Management**
   - Track initialization state
   - Check both status and account
   - Provide clear ready indicators

3. **Transaction Handling**
   - Verify account state before transactions
   - Implement recovery mechanisms
   - Handle loading and error states properly

4. **Error Recovery**
   - Implement automatic reconnection
   - Add retry mechanisms
   - Handle specific error cases

This implementation provides a robust solution to the "Account not initialized" error while maintaining a good user experience with proper loading states and error handling.

# Implementing useAgentSwap with Proper Account State Management

## Current Implementation Analysis

Let's look at how to properly implement the `useAgentSwap` hook using our account state management patterns:

```typescript
function useAgentSwap(params: SwapParams) {
  // 1. Use our account state management hook
  const { isReady, account, address } = useWalletConnection();
  const { executeWithRecovery } = useAccountWithRecovery();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Contract setup
  const { contract } = useContract({
    address: AGENT_CONTRACT_ADDRESS as `0x${string}`,
    abi: AGENT_ABI
  });

  // 3. Swap execution with proper account checks
  const executeSwap = useCallback(async () => {
    // Clear previous error state
    setError(null);

    // Check account readiness
    if (!isReady) {
      setError('Wallet not ready');
      return;
    }

    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    setIsProcessing(true);
    try {
      // Use our recovery wrapper
      return await executeWithRecovery(async () => {
        // Prepare transaction parameters
        const amountBigInt = BigInt(params.amount);
        const maxFeeBigInt = BigInt(1000000); // Adjust as needed

        // Execute the swap with proper parameters
        const response = await contract.invoke(
          'swap',
          [amountBigInt],
          {
            maxFee: maxFeeBigInt,
            // Important: Get nonce from account
            nonce: await account.getNonce()
          }
        );

        return response;
      });
    } catch (err) {
      console.error('Swap execution failed:', err);
      setError(err instanceof Error ? err.message : 'Swap failed');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [isReady, account, contract, params, executeWithRecovery]);

  return {
    executeSwap,
    isProcessing,
    error,
    isReady
  };
}
```

## Usage in Component

Here's how to use the updated hook in your swap component:

```typescript
function SwapComponent() {
  const { executeSwap, isProcessing, error, isReady } = useAgentSwap({
    amount: '1000000000000000000' // 1 ETH in wei
  });

  const handleSwap = async () => {
    try {
      const result = await executeSwap();
      console.log('Swap successful:', result.transaction_hash);
    } catch (err) {
      console.error('Swap failed:', err);
    }
  };

  return (
    <div>
      {error && (
        <div className="error">{error}</div>
      )}
      
      <button
        onClick={handleSwap}
        disabled={!isReady || isProcessing}
      >
        {isProcessing ? 'Processing Swap...' : 'Swap'}
      </button>
    </div>
  );
}
```

## Key Improvements

1. **Proper Account State Management**
   ```typescript
   const { isReady, account, address } = useWalletConnection();
   ```
   - Uses our custom hook for reliable account state
   - Provides clear ready state indicator
   - Handles initialization properly

2. **Error Recovery Integration**
   ```typescript
   const { executeWithRecovery } = useAccountWithRecovery();
   ```
   - Automatically handles account recovery
   - Retries transactions when needed
   - Provides consistent error handling

3. **Transaction State Management**
   ```typescript
   const [isProcessing, setIsProcessing] = useState(false);
   const [error, setError] = useState<string | null>(null);
   ```
   - Clear loading states
   - Proper error handling
   - User-friendly state indicators

4. **Proper Transaction Parameters**
   ```typescript
   const response = await contract.invoke(
     'swap',
     [amountBigInt],
     {
       maxFee: maxFeeBigInt,
       nonce: await account.getNonce()
     }
   );
   ```
   - Gets nonce from account
   - Sets proper max fee
   - Uses BigInt for amounts

## Best Practices for Swap Implementation

1. **State Checks**
   - Always verify `isReady` before transactions
   - Check contract initialization
   - Validate parameters

2. **Error Handling**
   - Clear error states before each operation
   - Proper error messages
   - Recovery mechanisms

3. **Transaction Flow**
   - Use `executeWithRecovery` wrapper
   - Proper parameter preparation
   - Clear state management

4. **User Experience**
   - Disable button when not ready
   - Show processing state
   - Display clear error messages

This implementation ensures proper account state management and provides a robust swap execution flow with proper error handling and recovery mechanisms.

# Understanding Wallet Connection vs Account State

## Relationship Between Wallet Connection and Account

In Starknet, there's an important distinction between wallet connection (`starknetWallet.isConnected`) and having a valid account:

1. **Wallet Connection** (`isConnected`)
   - Indicates the wallet is connected to your dApp
   - Does NOT guarantee account availability
   - Usually happens first in the connection flow

2. **Account Availability** (`account` object)
   - Represents a fully initialized account
   - Required for transactions
   - May take a moment to be available after connection

## Proper State Checking

Here's how we handle both states in our implementation:

```typescript
function useWalletConnection() {
  const { connect } = useConnect();
  const { account, address, status } = useAccount();
  const [isInitializing, setIsInitializing] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);

  // Track wallet connection
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const isConnected = await window.starknet?.isConnected();
        setWalletConnected(!!isConnected);
      } catch (err) {
        console.error('Error checking wallet connection:', err);
        setWalletConnected(false);
      }
    };

    checkWallet();
    // Optional: Set up wallet change listener
    window.starknet?.on('accountsChanged', checkWallet);
    return () => {
      window.starknet?.off('accountsChanged', checkWallet);
    };
  }, []);

  // Important: Check BOTH wallet connection AND account
  const isReady = useMemo(() => {
    return walletConnected && // Wallet is connected
           status === 'connected' && // Starknet status is connected
           !!account && // Account object exists
           !!address; // Address is available
  }, [walletConnected, status, account, address]);

  return {
    isReady,
    isInitializing,
    walletConnected,
    account,
    address,
    status
  };
}
```

## Connection Flow States

Here are the possible states in order:

1. **Initial State**
   ```typescript
   walletConnected: false
   status: 'disconnected'
   account: undefined
   ```

2. **Wallet Connected**
   ```typescript
   walletConnected: true
   status: 'connecting'
   account: undefined
   ```

3. **Account Ready**
   ```typescript
   walletConnected: true
   status: 'connected'
   account: { /* account object */ }
   ```

## Usage in Transaction Components

Always check both states before proceeding with transactions:

```typescript
function SwapComponent() {
  const { isReady, walletConnected, account } = useWalletConnection();

  const handleSwap = async () => {
    // Check complete wallet state
    if (!walletConnected) {
      console.error('Wallet not connected');
      return;
    }

    if (!isReady) {
      console.error('Account not initialized');
      return;
    }

    // Proceed with transaction
    try {
      await executeSwap();
    } catch (err) {
      console.error('Swap failed:', err);
    }
  };

  return (
    <div>
      {!walletConnected && (
        <div>Please connect your wallet</div>
      )}
      {walletConnected && !isReady && (
        <div>Waiting for account initialization...</div>
      )}
      <button 
        onClick={handleSwap}
        disabled={!isReady}
      >
        Swap
      </button>
    </div>
  );
}
```

## Best Practices for State Management

1. **Always Check Both States**
   ```typescript
   const canProceed = walletConnected && isReady;
   ```

2. **Handle State Changes**
   ```typescript
   useEffect(() => {
     if (walletConnected && !account) {
       // Wallet connected but account not ready
       console.log('Waiting for account...');
     }
   }, [walletConnected, account]);
   ```

3. **Provide Clear User Feedback**
   ```typescript
   function getConnectionStatus() {
     if (!walletConnected) return 'Connect Wallet';
     if (!account) return 'Initializing Account...';
     return 'Ready';
   }
   ```

4. **Handle Disconnections**
   ```typescript
   useEffect(() => {
     if (!walletConnected && wasConnected) {
       // Handle disconnection
       resetState();
     }
   }, [walletConnected]);
   ```

This relationship understanding is crucial for proper transaction handling and user experience. Always wait for both the wallet to be connected AND have a valid account before considering the system ready for transactions.

# Handling Starknet Status and Wallet State Mismatch

## Edge Case: Disconnected Status with Connected Wallet

This is a common edge case in Starknet where the wallet reports as connected but the Starknet status is still 'disconnected'. Here's how we handle it:

```typescript
function useWalletConnection() {
  const { connect } = useConnect();
  const { account, address, status } = useAccount();
  const [isInitializing, setIsInitializing] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);

  // Handle status mismatch
  useEffect(() => {
    const handleStatusMismatch = async () => {
      try {
        const isWalletConnected = await window.starknet?.isConnected();
        
        // If wallet is connected but Starknet status is disconnected
        if (isWalletConnected && status === 'disconnected') {
          console.log('Status mismatch detected, forcing reconnection...');
          // Force a reconnection
          await connect();
          
          // Wait for status to update
          let attempts = 0;
          const maxAttempts = 5;
          
          while (status === 'disconnected' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
          }
          
          if (status === 'disconnected') {
            console.error('Failed to synchronize wallet state');
          }
        }
      } catch (err) {
        console.error('Error handling status mismatch:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    handleStatusMismatch();
  }, [status, connect]);

  // Enhanced ready check that considers initialization state
  const isReady = useMemo(() => {
    return !isInitializing && // Not in initialization phase
           walletConnected && // Wallet reports connected
           status === 'connected' && // Starknet status is connected
           !!account && // Account object exists
           !!address; // Address is available
  }, [isInitializing, walletConnected, status, account, address]);

  return {
    isReady,
    isInitializing,
    walletConnected,
    account,
    address,
    status,
    forceReconnect: connect // Expose reconnect function
  };
}
```

## Usage with Status Mismatch Handling

```typescript
function SwapComponent() {
  const { 
    isReady, 
    walletConnected, 
    status, 
    isInitializing,
    forceReconnect 
  } = useWalletConnection();

  // Handle manual reconnection if needed
  const handleReconnect = async () => {
    try {
      await forceReconnect();
    } catch (err) {
      console.error('Reconnection failed:', err);
    }
  };

  return (
    <div>
      {isInitializing ? (
        <div>Initializing wallet connection...</div>
      ) : walletConnected && status === 'disconnected' ? (
        <div>
          Wallet state mismatch detected
          <button onClick={handleReconnect}>
            Reconnect
          </button>
        </div>
      ) : !walletConnected ? (
        <div>Please connect your wallet</div>
      ) : !isReady ? (
        <div>Waiting for account initialization...</div>
      ) : (
        <button onClick={handleSwap}>
          Swap
        </button>
      )}
    </div>
  );
}
```

## Key Points for Status Mismatch Handling

1. **Immediate Action**
   - Don't wait for automatic update
   - Force reconnection when mismatch detected
   - Set reasonable timeout for synchronization

2. **User Experience**
   ```typescript
   const getDetailedStatus = () => {
     if (isInitializing) return 'Initializing...';
     if (walletConnected && status === 'disconnected') {
       return 'Synchronizing wallet state...';
     }
     if (!walletConnected) return 'Connect Wallet';
     if (!isReady) return 'Initializing Account...';
     return 'Ready';
   };
   ```

3. **Recovery Strategy**
   ```typescript
   const synchronizeState = async () => {
     if (walletConnected && status === 'disconnected') {
       await connect();
       // Wait for status update with timeout
       const timeout = setTimeout(() => {
         console.error('State synchronization timeout');
       }, 5000);
       
       // Clear timeout if status updates
       if (status === 'connected') {
         clearTimeout(timeout);
       }
     }
   };
   ```

4. **Error Handling**
   ```typescript
   const handleStateError = async () => {
     try {
       await synchronizeState();
     } catch (err) {
       console.error('State synchronization failed:', err);
       // Optionally reset state
       setWalletConnected(false);
       // Notify user
       setError('Failed to synchronize wallet state');
     }
   };
   ```

This approach ensures we actively handle the status mismatch rather than waiting for automatic resolution, providing a better user experience and more reliable wallet state management.
