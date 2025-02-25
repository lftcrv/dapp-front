# Starknet Account Management Scripts

This repository contains a collection of scripts for managing Starknet accounts, including checking balances, deriving private keys, and transferring funds.

## Available Scripts

### 1. Check Account Balance

**File:** `scripts/check-starknet-balance.js`

This script checks the ETH balance of a Starknet account.

```bash
node scripts/check-starknet-balance.js
```

**Features:**
- Verifies if the account exists
- Displays the ETH balance in Wei, Gwei, and ETH
- Shows the account's transaction count (nonce)

### 2. Derive Private Key

**File:** `scripts/derive-private-key.js`

This script derives a Starknet private key from a signature, which is useful for recovering account access.

```bash
# Set the signature as an environment variable (optional)
export TEST_SIGNATURE="0x1234567890abcdef"

# Run the script
node scripts/derive-private-key.js
```

**Features:**
- Derives a private key from a signature using the same algorithm as the dApp
- Validates the key by deriving a public key
- Calculates the expected account address
- Provides instructions for using the key with other scripts

### 3. Transfer Funds to Admin

**File:** `scripts/transfer-funds-to-admin.js`

This script transfers 95% of an account's ETH balance back to the admin wallet, keeping a small amount for gas fees.

```bash
# Set the required environment variables
export TEST_ACCOUNT_PRIVATE_KEY="0x1234..."
export ADMIN_WALLET_ADDRESS="0x5678..."

# Run the script
node scripts/transfer-funds-to-admin.js
```

**Features:**
- Checks the current account balance
- Calculates 95% of the balance to transfer
- Keeps a minimum amount (0.0005 ETH) for gas fees
- Executes the transfer and verifies the new balance

### 4. Test Starknet Deployment

**File:** `scripts/test-starknet-deployment.js`

This script tests the Starknet account deployment process.

```bash
# Set the signature as an environment variable (optional)
export TEST_SIGNATURE="0x1234567890abcdef"

# Run the script
node scripts/test-starknet-deployment.js
```

**Features:**
- Derives a private key from a signature
- Calculates the public key and account address
- Checks if the account is already deployed
- Funds the account if needed
- Deploys the account if it doesn't exist

## Environment Variables

These scripts use the following environment variables:

| Variable | Description | Required By |
|----------|-------------|------------|
| `TEST_SIGNATURE` | Signature to derive the private key from | derive-private-key.js, test-starknet-deployment.js |
| `TEST_ACCOUNT_PRIVATE_KEY` | Private key of the account to transfer funds from | transfer-funds-to-admin.js |
| `ADMIN_WALLET_ADDRESS` | Address of the admin wallet to receive funds | transfer-funds-to-admin.js |
| `ADMIN_WALLET_PK` | Private key of the admin wallet | test-starknet-deployment.js |
| `STARKNET_RPC_URL` | URL of the Starknet RPC node | All scripts |

## Usage Examples

### Complete Fund Recovery Process

1. **Derive the private key from a signature**
   ```bash
   export TEST_SIGNATURE="0x1234567890abcdef"
   node scripts/derive-private-key.js
   ```

2. **Check the account balance**
   ```bash
   node scripts/check-starknet-balance.js
   ```

3. **Transfer funds back to admin**
   ```bash
   export TEST_ACCOUNT_PRIVATE_KEY="0x1e4fcd3b1ecd473d5393d9636435394b77da34df77e9474db337f4e980d16d2"
   export ADMIN_WALLET_ADDRESS="0x01e2F67d8132831f210E19c5Ee0197aA134308e16F7f284bBa2c72E28FC464D2"
   node scripts/transfer-funds-to-admin.js
   ```

4. **Verify the new balance**
   ```bash
   node scripts/check-starknet-balance.js
   ```

## Notes

- These scripts are designed for the Starknet Sepolia testnet by default
- The ETH token address is hardcoded for Sepolia: `0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`
- The account class hash is set to the OpenZeppelin account implementation: `0x04d07e40e93398ed3c76981e72dd1fd22557a78ce36c0515f679e27f0bb5bc5f` 