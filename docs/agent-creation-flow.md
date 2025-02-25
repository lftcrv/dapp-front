# Agent Creation Flow

This document explains the agent creation process in the application, focusing on the transaction flow.

## Overview

Creating an agent involves two main steps:
1. **Payment**: Transferring ETH to the deployment fees recipient
2. **Creation**: Submitting agent data to the API with the transaction hash as proof of payment

## Transaction Flow

### 1. Payment Process

When a user creates an agent, they need to pay a deployment fee in ETH. This is handled through a direct token transfer:

```
User Wallet -> ETH Token Contract -> Deployment Fees Recipient
```

The transaction is executed using the Starknet.js library:

```javascript
// Execute transfer
const transferCall = {
  contractAddress: ETH_TOKEN_ADDRESS,
  entrypoint: 'transfer',
  calldata: [
    recipientAddress,
    BigInt(amountToSend).toString(),
    '0', // For uint256, we need low and high parts
  ],
};

const response = await sendAsync([transferCall]);
```

Key points:
- The transfer is a standard ERC-20 token transfer
- The amount is specified in the environment variable `NEXT_PUBLIC_DEPLOYMENT_FEES`
- The recipient is specified in the environment variable `NEXT_PUBLIC_DEPLOYMENT_FEES_RECIPIENT`
- The transaction hash is used as proof of payment

### 2. Agent Creation

After the payment transaction is confirmed, the application calls the `createAgent` server action:

```javascript
const result = await createAgent(
  formData.name,
  characterConfig,
  curveSide,
  currentAddress,
  txHash,
  profilePicture
);
```

The `createAgent` function:
1. Validates the agent data
2. Creates a FormData object with all agent details
3. Includes the transaction hash as proof of payment
4. Submits the data to the API
5. Returns the result to the client

## Testing the Flow

To test the agent creation flow, you can use the `test-agent-creation-transfer.js` script:

```bash
node scripts/test-agent-creation-transfer.js
```

This script:
1. Connects to the Starknet network
2. Checks if the test account exists and has sufficient balance
3. Executes the token transfer to the deployment fees recipient
4. Waits for the transaction to be confirmed
5. Outputs the transaction hash that would be used for agent creation

## Environment Variables

The following environment variables are used:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_DEPLOYMENT_FEES_RECIPIENT` | Address of the wallet that receives deployment fees | Yes |
| `NEXT_PUBLIC_DEPLOYMENT_FEES` | Amount of ETH to send (in wei) | Yes |
| `NEXT_PUBLIC_ETH_TOKEN_ADDRESS` | Address of the ETH token contract | Yes |
| `NEXT_PUBLIC_NODE_URL` | URL of the Starknet RPC node | Yes |
| `ADMIN_WALLET_ADDRESS` | Address of the admin wallet (used for testing) | For testing |
| `ADMIN_WALLET_PK` | Private key of the admin wallet (used for testing) | For testing |
| `TEST_ACCOUNT_ADDRESS` | Optional override for test account address | No |
| `TEST_ACCOUNT_PRIVATE_KEY` | Optional override for test account private key | No |

For testing purposes, the script will use the admin wallet by default, but you can override this by setting `TEST_ACCOUNT_ADDRESS` and `TEST_ACCOUNT_PRIVATE_KEY`.

## Common Issues

1. **Insufficient Balance**: The user must have enough ETH to cover the deployment fee
2. **Transaction Failure**: The transaction might fail due to network issues or gas estimation problems
3. **Missing Transaction Hash**: The agent creation will fail if the transaction hash is not provided

## Integration with Frontend

The frontend handles the transaction flow through:
1. Collecting agent data from the form
2. Executing the token transfer
3. Waiting for transaction confirmation
4. Calling the `createAgent` function with the transaction hash
5. Showing appropriate loading and success/error states to the user 