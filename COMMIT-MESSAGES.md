# Commit Messages for EVM Wallet Derivation Feature

## 1. Initial Setup and Core Dependencies

```
feat(wallet): Initial setup for EVM wallet integration

- Add dependencies for EVM wallet support
- Configure wallet providers for both EVM and Starknet
- Add TypeScript declarations for global window functions
- Set up basic configuration files
```

## 2. Starknet Account Derivation Core

```
feat(wallet): Implement Starknet account derivation from EVM signatures

- Add key derivation functions from EVM signatures
- Create storage utilities for signatures and derived addresses
- Implement helper functions for Starknet account management
- Add constants for Starknet deployment
```

## 3. Wallet Context and Connection Handling

```
feat(wallet): Enhance wallet context for dual wallet support

- Update wallet context to handle both EVM and Starknet wallets
- Add connection handlers for different wallet types
- Implement wallet type detection and state management
- Add derived address tracking in wallet context
```

## 4. Transaction Handling for EVM-derived Wallets

```
feat(transactions): Add transaction support for EVM-derived wallets

- Implement transaction execution with derived keys
- Add manual transaction confirmation for EVM wallets
- Create utilities for transaction status monitoring
- Handle transaction errors for different wallet types
```

## 5. Agent Creation Integration

```
feat(agents): Integrate EVM wallet support with agent creation

- Update agent creation flow to support both wallet types
- Add address derivation checks before transactions
- Implement proper error handling for wallet-specific issues
- Ensure transaction confirmation before agent creation
```

## 6. Testing and Debugging Utilities

```
feat(tools): Add testing and debugging utilities for wallet derivation

- Create scripts for testing wallet derivation
- Add debugging tools for deployment issues
- Add documentation for the wallet derivation process
- Implement error logging for troubleshooting
```

## Final PR Description

```
# EVM Wallet Derivation Feature

This PR adds support for connecting with EVM wallets (like MetaMask) and deriving Starknet accounts from their signatures. This allows users to interact with Starknet contracts without needing a dedicated Starknet wallet.

## Key Features

- Users can connect with EVM wallets and derive Starknet accounts
- Transactions can be executed using derived keys
- Agent creation flow supports both wallet types
- Improved error handling and debugging tools

## Testing

- Tested with MetaMask on multiple browsers
- Verified transaction flow for both wallet types
- Confirmed agent creation works with derived addresses

## Documentation

- Added documentation for the wallet derivation process
- Created debugging tools for deployment issues
- Added scripts for testing wallet derivation
``` 