# Starknet Integration Guide

## Project Overview
This guide explains how to integrate Starknet blockchain functionality using `@starknet-react/core` and `starknetkit` libraries for wallet connection, transaction signing, and blockchain interactions.

## Core Functionalities
1. Wallet Connection
2. Chain Management
3. Contract Interactions
4. Transaction Handling

## Libraries and Dependencies
```json
{
  "@starknet-react/chains": "^3.1.1",
  "@starknet-react/core": "^3.7.2",
  "starknet": "^6.11.0",
  "starknetkit": "^2.6.1"
}
```

## Implementation Guide

### 1. Setting up Starknet Provider
```typescript
import { InjectedConnector } from "starknetkit/injected";
import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { WebWalletConnector } from "starknetkit/webwallet";
import { StarknetConfig, nethermindProvider } from "@starknet-react/core";

function StarknetProvider({ children }) {
  const connectors = [
    new InjectedConnector({ options: { id: "braavos" }}),
    new InjectedConnector({ options: { id: "argentX" }}),
    new WebWalletConnector({ url: "https://web.argent.xyz" }),
    // Add more connectors as needed
  ];

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={nethermindProvider({ apiKey: "YOUR_API_KEY" })}
      connectors={connectors}
    >
      {children}
    </StarknetConfig>
  );
}
```

### 2. Connecting Wallet
```typescript
import { useConnect, useAccount, useDisconnect } from "@starknet-react/core";
import { useStarknetkitConnectModal } from "starknetkit";

function WalletConnection() {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { starknetkitConnectModal } = useStarknetkitConnectModal();

  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <button onClick={connectWallet}>
      {address ? "Connected" : "Connect Wallet"}
    </button>
  );
}
```

### 3. Contract Interactions

#### 3.1 Project Structure
```
/providers
  - StarknetProvider.tsx    # Global Starknet configuration
  - ProjectsProvider.tsx    # Project-specific state management
/components
  - project/               # Project-related components
  - common/               # Shared components
/utils
  - abi.ts               # ABI handling utilities
  - starknet.ts          # Starknet helper functions
```

#### 3.2 Reading Contract Data
```typescript
// Using useReadContract hook
function ContractReader({ project }) {
  const { data, error, isLoading, refetch } = useReadContract({
    abi: project.abi,
    address: project.address,
    functionName: "get_balance",
    args: [address],
    watch: true,  // Auto-refresh on chain updates
    enabled: !!project.abi && !!address,
  });
}

// Using Contract instance
const { contract } = useContract({
  abi: project.abi,
  address: project.address,
});

// Read data
const balance = await contract.get_balance(address);
```

#### 3.3 Writing to Contracts
```typescript
// Single transaction
const { sendTransaction } = useSendTransaction({
  calls: [{
    contractAddress: CONTRACT_ADDRESS,
    entrypoint: "transfer",
    calldata: [recipient, amount]
  }]
});

// Multi-call transaction example
const calls = [
  contract.populate('set_approval_for_all', [spenderAddress, true]),
  contract.populate('transfer', [recipient, amount]),
  contract.populate('set_approval_for_all', [spenderAddress, false])
];

const { sendAsync, data } = useSendTransaction({
  calls: calls
});

// Handle transaction result
useEffect(() => {
  if (data) {
    const txHash = data.transaction_hash;
    // Handle success
    refreshData();
  }
}, [data]);
```

#### 3.4 Transaction Patterns

There are two main patterns for executing transactions in Starknet React:

#### Pattern 1: Using useSendTransaction
```typescript
function TransactionWithHook() {
  // Initialize with required calls parameter
  const { sendTransaction, data, isLoading, error } = useSendTransaction({
    calls: [{
      contractAddress: CONTRACT_ADDRESS,
      entrypoint: "transfer",
      calldata: [recipient, amount]
    }]
  });

  const handleTransaction = async () => {
    try {
      await sendTransaction();
      // Transaction sent successfully
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  return (
    <button 
      onClick={handleTransaction}
      disabled={isLoading}
    >
      {isLoading ? 'Sending...' : 'Send Transaction'}
    </button>
  );
}
```

#### Pattern 2: Using contract.invoke
```typescript
function TransactionWithInvoke() {
  const { contract } = useContract({
    abi: project.abi,
    address: project.address as `0x${string}`,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransaction = async () => {
    if (!contract) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await contract.invoke(
        'method_name',
        [param1, param2]
      );
      console.log('Transaction hash:', result.transaction_hash);
    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleTransaction}
      disabled={isLoading}
    >
      {isLoading ? 'Sending...' : 'Send Transaction'}
    </button>
  );
}
```

#### Key Differences and Usage Guidelines

1. **useSendTransaction**
   - Requires explicit `calls` parameter in initialization
   - Better for multi-call transactions
   - Provides built-in loading and error states
   - Example usage:
   ```typescript
   const { sendTransaction } = useSendTransaction({
     calls: [{
       contractAddress: CONTRACT_ADDRESS,
       entrypoint: "method_name",
       calldata: [param1, param2]
     }]
   });
   ```

2. **contract.invoke**
   - More direct approach for single contract calls
   - Requires manual state management
   - Better for simple transactions
   - Example usage:
   ```typescript
   const { contract } = useContract({
     abi: ABI,
     address: ADDRESS
   });
   await contract.invoke('method_name', [param1, param2]);
   ```

#### Complete Transaction Flow Example
```typescript
function CompleteTransactionExample() {
  // 1. Initialize contract and transaction hook
  const { contract } = useContract({
    abi: project.abi,
    address: project.address as `0x${string}`,
  });

  const { sendTransaction, isLoading, error } = useSendTransaction({
    calls: contract ? [
      contract.populate('method_name', [param1, param2])
    ] : undefined
  });

  // 2. Transaction state management
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  // 3. Handle transaction
  const handleTransaction = async () => {
    if (!contract) return;
    
    try {
      setStatus('pending');
      
      // Option 1: Using sendTransaction
      await sendTransaction();
      
      // Option 2: Using contract.invoke
      // const result = await contract.invoke('method_name', [param1, param2]);
      // setTxHash(result.transaction_hash);
      
      setStatus('success');
    } catch (err) {
      console.error('Transaction failed:', err);
      setStatus('error');
    }
  };

  // 4. Transaction result handling
  useEffect(() => {
    if (txHash) {
      // Handle successful transaction
      console.log('Transaction successful:', txHash);
      // Refresh data or update UI
    }
  }, [txHash]);

  return (
    <div>
      <button 
        onClick={handleTransaction}
        disabled={isLoading || status === 'pending'}
      >
        {status === 'pending' ? 'Confirming...' : 'Send Transaction'}
      </button>

      {status === 'pending' && (
        <div>Please confirm the transaction in your wallet...</div>
      )}

      {status === 'success' && (
        <div>
          Transaction successful!
          {txHash && <div>Hash: {txHash}</div>}
        </div>
      )}

      {status === 'error' && (
        <div className="error">
          Transaction failed: {error?.message}
        </div>
      )}
    </div>
  );
}
```

#### Best Practices for Transaction Implementation

1. **Choose the Right Pattern**
   - Use `useSendTransaction` for multi-call transactions or when you need built-in state management
   - Use `contract.invoke` for simple, single contract calls
   - Be consistent with your chosen pattern throughout the application

2. **Error Handling**
   - Always wrap transactions in try-catch blocks
   - Handle both user rejections and network errors
   - Provide clear error messages to users
   ```typescript
   try {
     await sendTransaction();
   } catch (err) {
     if (err.message.includes('User rejected')) {
       setError('Transaction was cancelled');
     } else {
       setError('Transaction failed. Please try again.');
     }
   }
   ```

3. **State Management**
   - Track transaction status (pending, success, error)
   - Store transaction hash for reference
   - Update UI based on transaction state
   ```typescript
   const [status, setStatus] = useState('idle');
   const [hash, setHash] = useState(null);

   useEffect(() => {
     if (data?.transaction_hash) {
       setHash(data.transaction_hash);
       setStatus('success');
     }
   }, [data]);
   ```

4. **User Feedback**
   - Show loading states during transaction
   - Display wallet popup warnings
   - Provide transaction hash and status updates
   ```typescript
   {status === 'pending' && (
     <div>
       <Spinner />
       <div>Please confirm in your wallet...</div>
     </div>
   )}
   ```

### 3.5 Transaction Confirmation and Wallet Popup

#### Common Issues with Transaction Confirmation
1. No wallet popup appears
2. Transaction is sent but not confirmed
3. Missing transaction feedback

#### Required Configuration
```typescript
// 1. Provider Configuration
function StarknetProvider({ children }) {
  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={nethermindProvider({ 
        apiKey: "YOUR_API_KEY",
        // Important: These options ensure proper transaction handling
        blockIdentifier: 'pending',
        chainId: chain.id 
      })}
      // Important: autoConnect helps with wallet state
      autoConnect={true}
      // Important: Configure default transaction options
      defaultTransactionOptions={{
        maxFee: 1000000n,
        version: 1n
      }}
    >
      {children}
    </StarknetConfig>
  );
}
```

#### Working Transaction Flow Example
```typescript
function WorkingTransactionExample() {
  // 1. Required hooks and state
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Contract setup with proper typing
  const { contract } = useContract({
    abi: project.abi,
    address: project.address as `0x${string}`,
  });

  // 3. Complete transaction handler
  const handleTransaction = async () => {
    if (!contract || !isConnected) {
      setError('Contract or wallet not ready');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Important: Prepare calls before invoke
      const calls = await contract.populate(
        'method_name',
        [param1, param2]
      );

      // Important: Use proper invoke parameters
      const response = await contract.invoke(
        'method_name',
        [param1, param2],
        {
          // These parameters are crucial for wallet popup
          maxFee: 1000000n,
          version: 1n,
          nonce: await contract.getNonce(),
        }
      );

      console.log('Transaction submitted:', response.transaction_hash);
      
      // Important: Wait for transaction acceptance
      await provider.waitForTransaction(response.transaction_hash);
      console.log('Transaction confirmed!');
      
    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
      
      // Important: Handle specific error cases
      if (err.message.includes('User rejected')) {
        setError('Transaction was rejected by user');
      } else if (err.message.includes('insufficient fee')) {
        setError('Insufficient fee. Please try again with a higher fee.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleTransaction}
        disabled={isLoading || !isConnected}
      >
        {isLoading ? 'Confirming...' : 'Send Transaction'}
      </button>
      
      {error && (
        <div className="error">{error}</div>
      )}
    </div>
  );
}
```

#### Alternative Using useSendTransaction
```typescript
function SendTransactionExample() {
  // 1. Required hooks
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  
  // 2. Contract setup
  const { contract } = useContract({
    abi: project.abi,
    address: project.address as `0x${string}`,
  });

  // 3. Transaction hook with required parameters
  const { sendTransaction, isLoading, error, reset } = useSendTransaction({
    calls: contract ? [
      {
        contractAddress: contract.address,
        entrypoint: 'method_name',
        calldata: [param1, param2]
      }
    ] : undefined,
    // Important: These options ensure wallet popup
    options: {
      maxFee: 1000000n,
      version: 1n,
      nonce: contract ? await contract.getNonce() : undefined,
    }
  });

  // 4. Transaction handler
  const handleTransaction = async () => {
    try {
      const response = await sendTransaction();
      console.log('Transaction hash:', response.transaction_hash);
      
      // Important: Wait for confirmation
      await provider.waitForTransaction(response.transaction_hash);
      console.log('Transaction confirmed!');
      
    } catch (err) {
      console.error('Transaction error:', err);
      // Handle errors...
    }
  };

  return (
    <div>
      <button
        onClick={handleTransaction}
        disabled={isLoading || !isConnected}
      >
        {isLoading ? 'Confirming...' : 'Send Transaction'}
      </button>
      
      {error && (
        <div className="error">
          {error.message}
          <button onClick={reset}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

#### Troubleshooting Transaction Confirmation

1. **No Wallet Popup**
   - Ensure proper provider configuration
   - Check wallet connection status
   - Verify transaction parameters
   ```typescript
   // Required transaction parameters
   const txParams = {
     maxFee: 1000000n,
     version: 1n,
     nonce: await contract.getNonce()
   };
   ```

2. **Transaction Not Confirmed**
   - Implement proper waiting mechanism
   - Handle transaction status
   ```typescript
   // Wait for confirmation
   const receipt = await provider.waitForTransaction(hash);
   if (receipt.status === 'ACCEPTED_ON_L2') {
     // Transaction confirmed
   }
   ```

3. **Error Handling**
   - Handle specific error cases
   - Provide clear user feedback
   ```typescript
   try {
     await sendTransaction();
   } catch (err) {
     if (err.message.includes('User rejected')) {
       // Handle user rejection
     } else if (err.message.includes('insufficient fee')) {
       // Handle fee issues
     } else {
       // Handle other errors
     }
   }
   ```

4. **Provider Configuration**
   - Set proper chain ID
   - Configure block identifier
   - Set default transaction options
   ```typescript
   const provider = nethermindProvider({
     apiKey: API_KEY,
     blockIdentifier: 'pending',
     chainId: chain.id,
     defaultTransactionOptions: {
       maxFee: 1000000n,
       version: 1n
     }
   });
   ```

5. **Wallet State**
   - Check connection status
   - Verify account access
   - Handle wallet changes
   ```typescript
   useEffect(() => {
     if (!isConnected) {
       // Reset state
     }
   }, [isConnected]);
   ```

### 4. Chain Management

#### 4.1 Chain Configuration
```typescript
import { mainnet, sepolia } from "@starknet-react/chains";

const chains = process.env.NEXT_PUBLIC_DEFAULT_CHAIN === sepolia.network 
  ? [sepolia, mainnet] 
  : [mainnet, sepolia];
```

#### 4.2 Chain Switching Component
```typescript
function ChainSwitcher() {
  const { chain } = useNetwork();
  const { status } = useAccount();
  const { switchChain } = useSwitchChain({
    params: {
      chainId: chain.id === sepolia.id
        ? constants.StarknetChainId.SN_MAIN
        : constants.StarknetChainId.SN_SEPOLIA,
    },
  });

  return (
    <Switch
      isSelected={chain.id !== sepolia.id}
      onValueChange={() => switchChain()}
      isDisabled={status === "disconnected"}
    />
  );
}
```

#### 4.3 Chain-Aware Data Loading
```typescript
function ChainAwareComponent() {
  const { chain } = useNetwork();
  const { provider } = useProvider();
  
  useEffect(() => {
    // Reset data on chain change
    if (previousChainId !== chain.id) {
      resetData();
      initializeData();
    }
  }, [chain.id]);
}
```

## Best Practices

1. **Error Handling**
   - Always wrap contract interactions in try-catch blocks
   - Provide user feedback for transaction status
   - Handle wallet connection errors gracefully
   ```typescript
   try {
     await sendAsync();
     console.log('Transaction sent successfully');
   } catch (err) {
     console.error('Error:', err);
     // Show user-friendly error message
   }
   ```

2. **Transaction Management**
   - Wait for transaction confirmation before updating UI
   - Provide transaction hash for user reference
   - Implement proper loading states
   ```typescript
   useEffect(() => {
     if (data) {
       const txHash = data.transaction_hash;
       setTxHash(txHash);
       setDisplayAlert(true);
       refreshUserData();
     }
   }, [data]);
   ```

3. **Security**
   - Never expose private keys or API keys
   - Validate user input before sending transactions
   - Implement proper approval flows for token transfers
   ```typescript
   // Example of secure approval flow
   const calls = [
     approvalContract.populate('set_approval_for_all', [spender, true]),
     mainContract.populate('transfer', [recipient, amount]),
     approvalContract.populate('set_approval_for_all', [spender, false])
   ];
   ```

4. **UX Considerations**
   - Show loading states during transactions
   - Provide clear feedback for successful/failed operations
   - Handle wallet disconnection gracefully
   ```typescript
   useEffect(() => {
     if (!isConnected) {
       resetUserData();
     }
   }, [isConnected]);
   ```

## Complete Implementation Examples

### 1. Full Transaction Component
```typescript
// Example of a complete transaction component with proper typing and error handling
interface TransactionCall {
  contractAddress: string;
  entrypoint: string;
  calldata: (string | number)[];
}

interface TransactionProps {
  project: ProjectWithAbi;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

function TransactionComponent({ project, onSuccess, onError }: TransactionProps) {
  // 1. Contract Setup
  const { contract: approvalContract } = useContract({
    abi: project.abi,
    address: project.project as `0x${string}`,
  });

  const { contract: mainContract } = useContract({
    abi: project.offsettorAbi,
    address: project.offsettor as `0x${string}`,
  });

  // 2. Transaction State Management
  const [calls, setCalls] = useState<TransactionCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3. Prepare Transaction Calls
  useEffect(() => {
    if (approvalContract && mainContract) {
      const preparedCalls = [
        approvalContract.populate('set_approval_for_all', [mainContract.address, true]),
        mainContract.populate('main_action', [param1, param2]),
        approvalContract.populate('set_approval_for_all', [mainContract.address, false])
      ];
      setCalls(preparedCalls);
    }
  }, [approvalContract, mainContract, param1, param2]);

  // 4. Transaction Execution
  const { sendAsync, data } = useSendTransaction({
    calls: calls.length > 0 ? calls : undefined,
  });

  // 5. Transaction Handler
  const handleTransaction = async () => {
    if (calls.length === 0) {
      setError('Transaction calls are not prepared');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendAsync();
      console.log('Transaction sent successfully');
    } catch (err) {
      console.error('Error sending transaction:', err);
      setError(err.message);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Transaction Result Handler
  useEffect(() => {
    if (data) {
      const txHash = data.transaction_hash;
      onSuccess?.(txHash);
      refreshUserData();
    }
  }, [data]);

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button 
        onClick={handleTransaction}
        disabled={isLoading || calls.length === 0}
      >
        {isLoading ? 'Processing...' : 'Submit Transaction'}
      </button>
    </div>
  );
}
```

### 2. Complete Provider Setup with Mobile Support
```typescript
import { InjectedConnector } from "starknetkit/injected";
import { ArgentMobileConnector, isInArgentMobileAppBrowser } from "starknetkit/argentMobile";
import { WebWalletConnector } from "starknetkit/webwallet";
import { mainnet, sepolia } from "@starknet-react/chains";
import { StarknetConfig, nethermindProvider } from "@starknet-react/core";

interface ProviderProps {
  children: ReactNode;
}

export default function StarknetProvider({ children }: ProviderProps) {
  // 1. Chain Configuration
  const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN;
  const chains = defaultChain === sepolia.network ? [sepolia, mainnet] : [mainnet, sepolia];
  
  // 2. Connector Configuration
  const connectors = isInArgentMobileAppBrowser() 
    ? [
        ArgentMobileConnector.init({
          options: {
            dappName: "Your dApp",
            projectId: "your-project",
            url: "https://your-url.com",
          },
          inAppBrowserOptions: {},
        })
      ] 
    : [
        new InjectedConnector({ options: { id: "braavos", name: "Braavos" }}),
        new InjectedConnector({ options: { id: "argentX", name: "Argent X" }}),
        new WebWalletConnector({ url: "https://web.argent.xyz" }),
        ArgentMobileConnector.init({
          options: {
            dappName: "Your dApp",
            projectId: "your-project",
            url: "https://your-url.com",
          },
        })
      ];

  return (
    <StarknetConfig
      chains={chains}
      provider={nethermindProvider({ apiKey: process.env.NEXT_PUBLIC_NETHERMIND_API_KEY })}
      connectors={connectors}
      autoConnect={true}
    >
      {children}
    </StarknetConfig>
  );
}
```

### 3. Chain-Aware Data Provider
```typescript
interface ProjectsContextState {
  projects: ProjectWithAbi[];
  myProjects: ProjectWithAbi[];
  isLoading: boolean;
  isLoadingUserData: boolean;
  refreshUserData: () => Promise<void>;
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { chain } = useNetwork();
  const { provider } = useProvider();
  const { isConnected, address } = useAccount();
  const [projects, setProjects] = useState<ProjectWithAbi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [previousChainId, setPreviousChainId] = useState<bigint | null>(null);

  // Initialize projects based on chain
  useEffect(() => {
    if (!initialized || previousChainId !== chain.id) {
      if (previousChainId !== null && previousChainId !== chain.id) {
        resetUserData();
      }
      initializeProjects();
    }
  }, [chain.id, initialized, previousChainId]);

  // Handle wallet connection changes
  useEffect(() => {
    if (isConnected && address && projects.length > 0) {
      if (!projects.some(project => project.userBalance !== undefined)) {
        fetchUserData();
      }
    } else if (!isConnected) {
      resetUserData();
    }
  }, [isConnected, address, projects.length]);

  return (
    <ProjectsContext.Provider value={{
      projects,
      myProjects,
      isLoading,
      isLoadingUserData,
      refreshUserData: fetchUserData,
    }}>
      {children}
    </ProjectsContext.Provider>
  );
}
```

### 4. Contract Reading with Error Handling
```typescript
function ContractDataReader({ project }: { project: ProjectWithAbi }) {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { 
    data: contractData, 
    error: contractError, 
    isLoading,
    refetch
  } = useReadContract({
    abi: project.abi,
    address: project.address as `0x${string}`,
    functionName: "get_data",
    args: [address],
    watch: true,
    enabled: !!project.abi && !!address && isConnected,
  });

  useEffect(() => {
    if (contractError) {
      setError('Failed to fetch contract data');
      console.error('Contract read error:', contractError);
    } else if (contractData) {
      setData(contractData);
      setError(null);
    }
  }, [contractData, contractError]);

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return (
      <div className="error">
        {error}
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {/* Render your data here */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

### 3.8 ABI Handling and Contract Class

#### Robust ABI Fetching Implementation
```typescript
// utils/abi.ts - Complete implementation for ABI fetching
async function fetchAbi(provider: ProviderInterface, address: string) {
  // 1. Try getClassAt first
  let result;
  try {
    result = await provider.getClassAt(address);
  } catch (e) {
    console.error(e);
    
    // 2. Fallback to getClassByHash
    try {
      result = await provider.getClassByHash(address);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  // 3. Check if contract is a proxy
  const abiResult = result.abi;
  const isProxy = abiResult.some((func) => (func.name === '__default__'));

  if (!isProxy) {
    return abiResult;
  }
  
  // 4. Handle proxy contracts by fetching implementation
  const proxyContract = new Contract(abiResult, address, provider);
  const possibleImplementationFunctionNames = [
    "implementation", 
    "getImplementation", 
    "get_implementation"
  ];
  
  // Find the correct implementation function
  const matchingFunctionName = possibleImplementationFunctionNames.find(
    name => proxyContract[name] && typeof proxyContract[name] === "function"
  );
  
  if (matchingFunctionName === undefined) {
    return undefined;
  }

  // 5. Get implementation address
  const { implementation, address: implementation_address, implementation_hash_ } = 
    await proxyContract[matchingFunctionName]();
  
  const hasImplementation = [implementation, implementation_address, implementation_hash_]
    .find(variable => variable !== undefined);

  if (hasImplementation === undefined) {
    return undefined;
  }

  // 6. Fetch implementation ABI
  const implementationAddress = num.toHex(hasImplementation);
  try {
    const compiledContract = await provider.getClassByHash(implementationAddress);
    return compiledContract.abi;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
```

#### Using the ABI Fetcher in Components

```typescript
function useContractAbi(address: string) {
  const { provider } = useProvider();
  const [abi, setAbi] = useState<Abi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAbi = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const result = await fetchAbi(provider, address);
      if (!result) {
        throw new Error('Failed to fetch ABI');
      }
      setAbi(result);
    } catch (err) {
      console.error('Error loading ABI:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [provider, address]);

  useEffect(() => {
    loadAbi();
  }, [loadAbi]);

  return { abi, error, isLoading, reload: loadAbi };
}

// Usage in component
function ContractInteraction({ address }: { address: string }) {
  const { abi, error, isLoading } = useContractAbi(address);
  const { contract } = useContract({
    address: address as `0x${string}`,
    abi: abi || undefined,
  });

  if (isLoading) {
    return <div>Loading contract ABI...</div>;
  }

  if (error) {
    return <div>Error loading ABI: {error}</div>;
  }

  if (!abi) {
    return <div>No ABI found for contract</div>;
  }

  return (
    <div>
      {/* Contract interaction UI */}
    </div>
  );
}
```

#### Key Features of ABI Handling

1. **Proxy Contract Detection**
   - Checks for `__default__` function to identify proxies
   - Supports multiple implementation getter functions
   - Handles different implementation address formats

2. **Fallback Mechanisms**
   ```typescript
   // Primary attempt with getClassAt
   try {
     result = await provider.getClassAt(address);
   } catch (e) {
     // Fallback to getClassByHash
     result = await provider.getClassByHash(address);
   }
   ```

3. **Error Handling**
   - Graceful fallbacks for each failure case
   - Clear error messages for debugging
   - Type-safe implementation returns

4. **Implementation Resolution**
   ```typescript
   // Multiple ways to get implementation address
   const { implementation, address: implementation_address, implementation_hash_ } = 
     await proxyContract[matchingFunctionName]();
   ```

#### Best Practices for ABI Handling

1. **Always Use Fallbacks**
   - Try `getClassAt` first
   - Fall back to `getClassByHash`
   - Handle proxy contracts appropriately

2. **Handle Proxy Patterns**
   - Check for proxy contracts
   - Support multiple implementation getter functions
   - Resolve implementation addresses correctly

3. **Error Management**
   - Log errors for debugging
   - Provide meaningful error messages
   - Handle all potential failure cases

4. **Type Safety**
   - Use proper typing for ABIs
   - Handle undefined cases
   - Validate ABI structure

### 3.9 Working Multi-Call Transaction Example with Approval Flow

Here's a complete working example based on the actual implementation:

```typescript
function OffsetRequestModal({ 
  vintage,
  maxAmount,
  decimals,
  project,
  setTxHash,
  setDisplayAlert,
  refetchOffsettor,
  refetchVintages 
}: OffsetModalProps) {
  // 1. Contract Setup - Initialize both contracts
  const { contract: approvalContract } = useContract({
    abi: project.abi,
    address: project.project as `0x${string}`,
  });

  const { contract: offsetContract } = useContract({
    abi: project.offsettorAbi,
    address: project.offsettor as `0x${string}`,
  });

  // 2. Prepare Transaction Calls
  const [calls, setCalls] = useState<any[]>([]);

  useEffect(() => {
    if (approvalContract && offsetContract) {
      const projectAddress = project.project as `0x${string}`;
      const amountU256 = BigInt(amount);
      const vintageU256 = BigInt(vintage);

      // Important: Order of calls matters
      const preparedCalls = [
        // 1. Approve the offsettor contract
        approvalContract.populate('set_approval_for_all', [offsetContract.address, true]),
        // 2. Execute the main action
        offsetContract.populate('request_offset', [projectAddress, amountU256, vintageU256]),
        // 3. Remove approval
        approvalContract.populate('set_approval_for_all', [offsetContract.address, false]),
      ];

      setCalls(preparedCalls);
    }
  }, [approvalContract, offsetContract, amount, vintage, project.project]);

  // 3. Transaction Hook
  const { sendAsync, data } = useSendTransaction({
    calls: calls.length > 0 ? calls : undefined,
  });

  // 4. Transaction Handler
  const handleRequest = async () => {
    if (calls.length === 0) {
      console.error('Transaction calls are not prepared');
      return;
    }

    try {
      await sendAsync();
      console.log('Multicall transaction sent successfully');
    } catch (err) {
      console.error('Error sending multicall transaction:', err);
    }
  };

  // 5. Handle Transaction Result
  useEffect(() => {
    if (data) {
      const txHash = data.transaction_hash;
      setTxHash(txHash);
      setDisplayAlert(true);
      refreshUserData();
      refetchOffsettor();
      refetchVintages();
      onClose();
    }
  }, [data]);

  return (
    <Button 
      onClick={handleRequest}
      disabled={calls.length === 0}
    >
      Request offset
    </Button>
  );
}
```

#### Key Points for Working Transactions

1. **Contract Initialization**
   ```typescript
   // Initialize both contracts properly
   const { contract: approvalContract } = useContract({
     abi: project.abi,
     address: project.project as `0x${string}`,
   });
   ```

2. **Prepare Calls in useEffect**
   ```typescript
   useEffect(() => {
     if (approvalContract && offsetContract) {
       const preparedCalls = [
         approvalContract.populate('method', [params]),
         // ... more calls
       ];
       setCalls(preparedCalls);
     }
   }, [approvalContract, offsetContract, /* other dependencies */]);
   ```

3. **Transaction Hook Setup**
   ```typescript
   const { sendAsync, data } = useSendTransaction({
     calls: calls.length > 0 ? calls : undefined,
   });
   ```

4. **Proper Error Handling**
   ```typescript
   const handleTransaction = async () => {
     if (calls.length === 0) {
       console.error('Transaction calls are not prepared');
       return;
     }

     try {
       await sendAsync();
     } catch (err) {
       console.error('Transaction failed:', err);
     }
   };
   ```

5. **Result Handling**
   ```typescript
   useEffect(() => {
     if (data) {
       const txHash = data.transaction_hash;
       setTxHash(txHash);
       setDisplayAlert(true);
       refreshUserData();
     }
   }, [data]);
   ```

#### Common Issues and Solutions

1. **No Wallet Popup**
   - Ensure contracts are properly initialized
   - Check that calls array is not empty
   - Verify all addresses are properly formatted with `as '0x${string}'`

2. **Transaction Not Sending**
   - Make sure all contract calls are properly populated
   - Check that all BigInt conversions are correct
   - Verify the order of approval and execution calls

3. **Type Errors**
   - Use proper type assertions for addresses
   - Convert numbers to BigInt where needed
   - Properly type the calls array

4. **State Management**
   - Initialize calls in useEffect
   - Update calls when dependencies change
   - Clear calls when component unmounts

### 3.10 Account Initialization and Transaction Execution Patterns

#### Account Initialization Patterns

1. **Using useAccount Hook (Recommended)**
```typescript
function TransactionComponent() {
  // This is the recommended way to get the connected account
  const { account } = useAccount();
  
  // The account object contains:
  // - address: The account address
  // - accountType: The type of account (argentX, braavos, etc.)
  // - provider: The provider instance
  
  // Use account for transactions
  const handleTransaction = async () => {
    if (!account) {
      console.error('No account connected');
      return;
    }
    
    try {
      const result = await account.execute({
        contractAddress: contractAddress,
        entrypoint: 'method_name',
        calldata: [param1, param2]
      });
      console.log('Transaction hash:', result.transaction_hash);
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };
}
```

2. **Manual Account Creation (Not Recommended)**
```typescript
// ❌ Don't use this pattern unless you have a specific reason
const account = new Account(provider, address, privateKey);
```

3. **Wallet Account (Advanced)**
```typescript
function WalletAccountExample() {
  // Get wallet instance
  const { wallet } = useWallet();
  
  // The wallet's account should be used through useAccount()
  // rather than accessed directly
  const { account } = useAccount();
  
  // Verify account is connected
  if (!account) {
    return <div>Please connect your wallet</div>;
  }
}
```

#### Transaction Execution Patterns

1. **Using useSendTransaction Hook (Recommended for Multiple Calls)**
```typescript
function TransactionWithHook() {
  const { account } = useAccount();
  
  // Initialize with calls
  const { sendTransaction, data, isLoading, error } = useSendTransaction({
    calls: [{
      contractAddress: CONTRACT_ADDRESS,
      entrypoint: "method_name",
      calldata: [param1, param2]
    }]
  });

  const handleTransaction = async () => {
    try {
      const response = await sendTransaction();
      console.log('Transaction hash:', response.transaction_hash);
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };
}
```

2. **Using Contract Invoke (Recommended for Single Calls)**
```typescript
function TransactionWithContract() {
  const { account } = useAccount();
  const { contract } = useContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI
  });

  const handleTransaction = async () => {
    if (!contract || !account) return;

    try {
      const response = await contract.invoke(
        'method_name',
        [param1, param2],
        {
          maxFee: 1000000n,
          nonce: await contract.getNonce()
        }
      );
      console.log('Transaction hash:', response.transaction_hash);
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };
}
```

3. **Using Account Execute (Advanced)**
```typescript
function TransactionWithAccount() {
  const { account } = useAccount();

  const handleTransaction = async () => {
    if (!account) return;

    try {
      const response = await account.execute({
        contractAddress: CONTRACT_ADDRESS,
        entrypoint: 'method_name',
        calldata: [param1, param2]
      });
      console.log('Transaction hash:', response.transaction_hash);
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };
}
```

#### Complete Working Example

```typescript
function SwapExample() {
  // 1. Account and Contract Setup
  const { account } = useAccount();
  const { contract } = useContract({
    address: SWAP_CONTRACT_ADDRESS as `0x${string}`,
    abi: SWAP_ABI
  });

  // 2. Transaction State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // 3. Swap Function
  const handleSwap = async (amountInWei: bigint) => {
    if (!contract || !account) {
      setError('Contract or account not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Option 1: Using contract.invoke
      const response = await contract.invoke(
        'swap',
        [amountInWei],
        {
          maxFee: 1000000n,
          nonce: await contract.getNonce()
        }
      );

      // Option 2: Using account.execute
      // const response = await account.execute({
      //   contractAddress: SWAP_CONTRACT_ADDRESS,
      //   entrypoint: 'swap',
      //   calldata: [amountInWei]
      // });

      // Option 3: Using useSendTransaction
      // const response = await sendTransaction({
      //   contractAddress: SWAP_CONTRACT_ADDRESS,
      //   entrypoint: 'swap',
      //   calldata: [amountInWei]
      // });

      setTxHash(response.transaction_hash);
      
      // Wait for transaction confirmation
      await provider.waitForTransaction(response.transaction_hash);
      console.log('Swap confirmed!');
      
    } catch (err) {
      console.error('Swap failed:', err);
      setError(err instanceof Error ? err.message : 'Swap failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => handleSwap(1000000n)}
        disabled={isLoading || !account}
      >
        {isLoading ? 'Swapping...' : 'Swap'}
      </button>
      
      {error && (
        <div className="error">{error}</div>
      )}
      
      {txHash && (
        <div>Transaction: {txHash}</div>
      )}
    </div>
  );
}
```

#### Key Points for Account and Transaction Management

1. **Account Initialization**
   - Always use `useAccount()` hook to get the connected account
   - Don't create Account instances manually
   - Verify account existence before transactions

2. **Transaction Preparation**
   - Use `contract.populate()` for preparing calls
   - Convert numbers to BigInt where needed
   - Prepare transaction parameters (maxFee, nonce)

3. **Transaction Execution**
   - Choose the appropriate pattern based on your needs:
     - `useSendTransaction` for multiple calls
     - `contract.invoke` for single calls
     - `account.execute` for advanced cases

4. **Error Handling**
   - Check account and contract existence
   - Handle user rejections
   - Provide clear error messages
   - Wait for transaction confirmation

5. **State Management**
   - Track loading state
   - Store transaction hash
   - Handle success/error states
   - Update UI appropriately

### 3.11 Handling Account Initialization Errors

#### Common Account Initialization Issues

1. **Account Not Initialized Error**
```typescript
function useSwapHook() {
  const { account, address, status } = useAccount();
  const { chain } = useNetwork();
  
  // 1. Check account status before executing transactions
  const executeSwap = useCallback(async () => {
    // Check connection status first
    if (status !== 'connected') {
      throw new Error('Wallet not connected');
    }

    // Check account existence
    if (!account || !address) {
      throw new Error('Account not initialized');
    }

    // Proceed with transaction
    try {
      const response = await contract.invoke(
        'swap',
        [param1, param2],
        {
          maxFee: 1000000n,
          nonce: await account.getNonce()
        }
      );
      return response;
    } catch (err) {
      console.error('Swap execution failed:', err);
      throw err;
    }
  }, [account, address, status, contract]);

  return { executeSwap };
}
```

2. **Complete Account State Management**
```typescript
function SwapWidget() {
  const { account, address, status } = useAccount();
  const { chain } = useNetwork();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check account readiness
  useEffect(() => {
    const checkAccountReady = async () => {
      setError(null);
      
      if (status !== 'connected') {
        setError('Please connect your wallet');
        setIsReady(false);
        return;
      }

      if (!account || !address) {
        setError('Account not initialized');
        setIsReady(false);
        return;
      }

      try {
        // Optional: Verify account has required balance/permissions
        const balance = await account.getBalance();
        if (balance === 0n) {
          setError('Insufficient balance');
          setIsReady(false);
          return;
        }

        setIsReady(true);
      } catch (err) {
        console.error('Error checking account:', err);
        setError('Failed to verify account');
        setIsReady(false);
      }
    };

    checkAccountReady();
  }, [account, address, status]);

  const handleSwap = async () => {
    if (!isReady) {
      console.error('Account not ready:', error);
      return;
    }

    try {
      // Proceed with swap
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div>
      {error && (
        <div className="error">
          {error}
          {status !== 'connected' && (
            <button onClick={() => connect()}>Connect Wallet</button>
          )}
        </div>
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

3. **Proper Error Handling with Recovery**
```typescript
function useAccountWithRecovery() {
  const { account, address, status } = useAccount();
  const { connect } = useConnect();
  const [isRecovering, setIsRecovering] = useState(false);

  const recoverAccount = async () => {
    setIsRecovering(true);
    try {
      // Attempt to reconnect
      await connect();
      
      // Verify account is now initialized
      if (!account || !address) {
        throw new Error('Account recovery failed');
      }
    } catch (err) {
      console.error('Account recovery failed:', err);
      throw err;
    } finally {
      setIsRecovering(false);
    }
  };

  const executeWithRecovery = async (
    transaction: () => Promise<any>
  ) => {
    try {
      return await transaction();
    } catch (err) {
      if (err.message === 'Account not initialized') {
        await recoverAccount();
        // Retry transaction after recovery
        return await transaction();
      }
      throw err;
    }
  };

  return { executeWithRecovery, isRecovering };
}

// Usage in component
function SwapComponent() {
  const { executeWithRecovery, isRecovering } = useAccountWithRecovery();
  
  const handleSwap = async () => {
    try {
      await executeWithRecovery(async () => {
        // Your swap logic here
        await contract.invoke('swap', [params]);
      });
    } catch (err) {
      console.error('Swap failed:', err);
    }
  };

  return (
    <button 
      onClick={handleSwap}
      disabled={isRecovering}
    >
      {isRecovering ? 'Recovering Account...' : 'Swap'}
    </button>
  );
}
```

#### Best Practices for Account Management

1. **Always Check Account State**
```typescript
const checkAccountState = () => {
  if (status !== 'connected') {
    throw new Error('Wallet not connected');
  }
  
  if (!account || !address) {
    throw new Error('Account not initialized');
  }
  
  return true;
};
```

2. **Implement Connection Recovery**
```typescript
const recoverConnection = async () => {
  try {
    await connect();
    // Wait for account to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (!account) {
      throw new Error('Recovery failed');
    }
  } catch (err) {
    console.error('Connection recovery failed:', err);
    throw err;
  }
};
```

3. **Handle Network Changes**
```typescript
useEffect(() => {
  // Reset account state on network change
  if (previousChainId && previousChainId !== chain.id) {
    resetAccountState();
  }
}, [chain.id]);
```

4. **Proper Error Messages**
```typescript
const getAccountErrorMessage = (error: Error) => {
  if (error.message.includes('Account not initialized')) {
    return 'Please reconnect your wallet';
  }
  if (error.message.includes('User rejected')) {
    return 'Transaction was rejected';
  }
  return 'An error occurred';
};
```

5. **Account State Monitoring**
```typescript
function useAccountMonitor() {
  const { account, status } = useAccount();
  const [isAccountReady, setIsAccountReady] = useState(false);

  useEffect(() => {
    const checkAccount = async () => {
      if (status === 'connected' && account) {
        try {
          await account.getNonce();
          setIsAccountReady(true);
        } catch (err) {
          setIsAccountReady(false);
        }
      } else {
        setIsAccountReady(false);
      }
    };

    checkAccount();
  }, [account, status]);

  return isAccountReady;
}
```

### 3.12 Wallet Initialization and Account State Synchronization

#### Proper Provider Setup
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
      provider={nethermindProvider({ apiKey: process.env.NEXT_PUBLIC_NETHERMIND_API_KEY })}
      connectors={connectors}
      autoConnect={true} // Critical for proper initialization
    >
      {children}
    </StarknetConfig>
  );
}
```

#### Account State Management
```typescript
function useWalletConnection() {
  const { connect } = useConnect();
  const { account, address, status } = useAccount();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        if (!account && status !== 'connected') {
          await connect();
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeWallet();
  }, []);

  const isReady = useMemo(() => {
    return status === 'connected' && !!account && !!address;
  }, [status, account, address]);

  return { isReady, isInitializing, account, address, status };
}
```

#### Transaction State Verification
```typescript
function useTransaction() {
  const { account, address, status } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const executeTransaction = useCallback(async (
    transaction: () => Promise<any>
  ) => {
    if (status !== 'connected' || !account || !address) {
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

#### Common Issues and Solutions

1. **Account Not Initialized**
   - Ensure `autoConnect` is true in StarknetConfig
   - Wait for both status AND account to be ready
   - Use proper initialization checks

2. **Wallet Connection State**
   - Monitor both wallet and account state
   - Handle initialization phase
   - Provide clear loading states

3. **Transaction Execution**
   - Verify account state before each transaction
   - Handle loading and error states
   - Provide proper user feedback

// ... existing code ... 