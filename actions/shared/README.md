# Starknet Wallet Deployment

This directory contains the code for deploying Starknet wallets for users of the application.

## Overview

The Starknet wallet deployment process involves several steps:

1. Deriving a private key from a user's signature
2. Calculating the public key and account address
3. Funding the account with ETH
4. Deploying the account contract

## Key Files

- `derive-starknet-account.ts`: Handles the derivation of Starknet accounts from EVM signatures
- `deploy-starknet-wallet.ts`: Contains functions for funding and deploying Starknet wallets
- `handle-starknet-connection.ts`: Manages the connection between users and their Starknet accounts

## Deployment Process

The deployment process follows these steps:

1. A user signs a message with their EVM wallet
2. The signature is used to derive a Starknet private key
3. The private key is used to calculate the public key and account address
4. The account is funded with ETH from an admin wallet
5. The account contract is deployed using the OpenZeppelin Account implementation
6. The user is associated with the deployed Starknet account

## Functions

### `deployStarknetWallet(privateKey: string)`

Deploys a Starknet wallet using the provided private key. This function:

- Calculates the public key from the private key
- Computes the account address
- Checks if the account is already deployed
- Funds the account if needed
- Deploys the account contract
- Returns the deployed account address and transaction hash

### `fundWallet(recipientAddress: string)`

Funds a Starknet wallet with ETH. This function:

- Validates environment variables
- Initializes the admin account
- Transfers ETH to the recipient address
- Returns the transaction hash

### `fundAndDeployWallet(privateKey: string)`

Combines the funding and deployment steps into a single function. This is the recommended function to use for most cases.

## Logging

The deployment process includes detailed logging to help diagnose issues:

- All logs are prefixed with `[Starknet Wallet]:` for easy identification
- Error logs are prefixed with `[Starknet Wallet Error]:`
- Wallet operation logs are prefixed with `[Wallet Operation]:`

## Environment Variables

The following environment variables are required:

- `ADMIN_WALLET_PK`: Private key of the admin wallet used for funding
- `ADMIN_WALLET_ADDRESS`: Address of the admin wallet
- `NEXT_PUBLIC_ETH_TOKEN_ADDRESS`: Address of the ETH token contract
- `NEXT_PUBLIC_NODE_URL`: URL of the Starknet node (defaults to Starknet Sepolia)

## Example Usage

```typescript
import { fundAndDeployWallet } from '@/actions/shared/deploy-starknet-wallet';

// Deploy a wallet using a derived private key
const result = await fundAndDeployWallet(privateKey);

if (result.success) {
  console.log(`Wallet deployed at ${result.address}`);
  console.log(`Transaction hash: ${result.txHash}`);
} else {
  console.error(`Deployment failed: ${result.error}`);
}
```

## Troubleshooting

If you encounter issues with the deployment process:

1. Check the logs for detailed error messages
2. Verify that all environment variables are correctly set
3. Ensure the admin wallet has sufficient ETH for funding
4. Check the Starknet node status and connection
5. Verify that the private key is valid and properly formatted 