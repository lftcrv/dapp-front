# Starknet Token Approval

This document explains the implementation of token approvals for Starknet wallets in the application.

## Overview

The application supports two types of wallet connections:

1. **Native Starknet Wallets** - Users connect directly with a Starknet wallet
2. **EVM Wallets** - Users connect with an Ethereum wallet, and a Starknet account is derived from their signature

For token approvals (such as when creating an agent), we need to handle both connection types differently:

- **Native Starknet Wallets**: The frontend handles the transaction using the wallet's API
- **EVM-derived Wallets**: We use the derived private key to sign and execute the transaction

## Implementation

### Core Components

1. **Server Actions**
   - `starknet-transactions.ts` - Contains server actions for handling token approvals

2. **Client Components**
   - `starknet-token-approval.tsx` - A reusable button component for token approvals

### How It Works

#### For EVM-derived Wallets

1. When a user connects with an EVM wallet, we derive a private key from their signature
2. The signature is stored securely in the server
3. When the user needs to approve tokens:
   - We retrieve the stored signature
   - Derive the private key
   - Create and sign the approval transaction
   - Execute the transaction without requiring additional user interaction

#### For Native Starknet Wallets

1. When a user connects with a Starknet wallet, we use their wallet address directly
2. When the user needs to approve tokens:
   - We prepare the transaction data
   - The frontend handles the transaction using the wallet's API
   - The user will need to approve the transaction in their wallet

## Usage

To add token approval to a page:

```tsx
import { StarknetTokenApproval } from '@/components/starknet-token-approval';

// In your component
<StarknetTokenApproval
  spenderAddress={AGENT_CONTRACT_ADDRESS}
  tokenAddress={ETH_TOKEN_ADDRESS}
  tokenAmount={APPROVAL_AMOUNT}
  onSuccess={(txHash) => {
    // Handle successful approval
  }}
  onError={(error) => {
    // Handle error
  }}
  buttonText="Approve Agent Creation"
/>
```

## Integration with Agent Creation

See the example in `examples/agent-approval-integration.tsx` for a complete implementation of how to integrate token approval with the agent creation flow.

## Testing

To test the implementation:

1. Connect with an EVM wallet to test the EVM-derived flow
2. Connect with a Starknet wallet to test the native Starknet flow
3. Check the console logs for detailed information about the approval process

## Troubleshooting

Common issues:

- **"No signature found for this EVM address"**: The user needs to reconnect their EVM wallet
- **"Account has insufficient balance"**: The user needs to fund their Starknet account
- **"Account not deployed"**: The user's Starknet account hasn't been deployed yet 