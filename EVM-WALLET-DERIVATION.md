# EVM Wallet Derivation Feature

## Overview

This feature enables users to connect with EVM wallets (like MetaMask) and derive Starknet accounts from their signatures. This allows users to interact with Starknet contracts without needing a dedicated Starknet wallet.

## Key Components

1. **Account Derivation**: Deriving Starknet private keys from EVM signatures
2. **Wallet Management**: Handling both EVM and Starknet wallet connections
3. **Transaction Handling**: Supporting transactions from both wallet types
4. **Agent Creation Flow**: Integrating with the agent creation process

## Commit Structure

### 1. Initial Setup and Core Dependencies

- Add necessary dependencies for EVM wallet integration
- Set up basic configuration for wallet providers
- Create TypeScript declarations for global window functions

### 2. Starknet Account Derivation Core

- Implement key derivation from EVM signatures
- Add storage utilities for signatures and derived addresses
- Create helper functions for Starknet account management

### 3. Wallet Context and Connection Handling

- Enhance wallet context to support both wallet types
- Add connection handlers for EVM and Starknet wallets
- Implement wallet type detection and state management

### 4. Transaction Handling for EVM-derived Wallets

- Add support for executing transactions with derived keys
- Implement manual transaction confirmation for EVM wallets
- Create utilities for transaction status monitoring

### 5. Agent Creation Integration

- Update agent creation flow to support both wallet types
- Add address derivation checks before transactions
- Implement proper error handling for wallet-specific issues

### 6. Testing and Debugging Utilities

- Add scripts for testing wallet derivation
- Create debugging tools for deployment issues
- Add documentation for the wallet derivation process

## Technical Details

### EVM to Starknet Derivation Process

1. User connects with an EVM wallet (e.g., MetaMask)
2. User signs a message to prove ownership of the wallet
3. The signature is used to derive a Starknet private key
4. The private key is used to calculate the public key and account address
5. The account is deployed if it doesn't exist
6. The user can now interact with Starknet contracts

### Transaction Flow for EVM-derived Wallets

1. For EVM wallets, we retrieve the stored signature
2. We derive the private key from the signature
3. We initialize a Starknet provider and account with the derived key
4. We execute the transaction and manually wait for confirmation
5. We handle success/error cases directly in the code

## Benefits

- Users can interact with Starknet without needing a dedicated wallet
- Simplified onboarding process for Ethereum users
- Consistent user experience across wallet types
- Improved reliability for transaction handling 