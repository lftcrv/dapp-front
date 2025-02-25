# Starknet Testing Scripts

This directory contains scripts for testing various Starknet functionality in the application.

## Available Scripts

### Agent Creation Flow Test

**File:** `test-agent-creation-flow.js`

This script tests the complete agent creation flow, including the token transfer and agent creation process. It simulates both Starknet and EVM wallet interactions.

```bash
# Test with default Starknet wallet
node scripts/test-agent-creation-flow.js

# Test with EVM wallet simulation
TEST_WALLET_TYPE=evm node scripts/test-agent-creation-flow.js
```

**What it does:**
- Connects to the Starknet network
- Simulates different wallet types (Starknet or EVM)
- Checks the account balance
- Transfers the deployment fee to the recipient
- Waits for transaction confirmation
- Simulates the agent creation process with the transaction hash
- Verifies the final account balance

**Environment Variables:**
- Uses existing variables from `.env`
- By default, uses the admin wallet credentials
- Can be overridden with `TEST_ACCOUNT_ADDRESS` and `TEST_ACCOUNT_PRIVATE_KEY`
- Set `TEST_WALLET_TYPE` to `starknet` or `evm` to simulate different wallet types

### Agent Creation Transfer Test

**File:** `test-agent-creation-transfer.js`

This script tests the token transfer process used in agent creation. It simulates the payment step of creating an agent by transferring ETH to the deployment fees recipient.

```bash
node scripts/test-agent-creation-transfer.js
```

**What it does:**
- Connects to the Starknet network
- Uses the admin wallet by default (can be overridden)
- Checks the account balance
- Transfers the deployment fee to the recipient
- Returns the transaction hash that would be used for agent creation

**Environment Variables:**
- Uses existing variables from `.env`
- By default, uses the admin wallet credentials
- Can be overridden with `TEST_ACCOUNT_ADDRESS` and `TEST_ACCOUNT_PRIVATE_KEY`

### Starknet Deployment Test

**File:** `test-starknet-deployment.js`

Tests the Starknet account deployment process.

```bash
node scripts/test-starknet-deployment.js
```

### Check Starknet Balance

**File:** `check-starknet-balance.js`

Checks the ETH balance of a Starknet account.

```bash
node scripts/check-starknet-balance.js
```

### Transfer Funds to Admin

**File:** `transfer-funds-to-admin.js`

Transfers funds from a Starknet account back to the admin wallet.

```bash
node scripts/transfer-funds-to-admin.js
```

### Derive Private Key

**File:** `derive-private-key.js`

Derives a Starknet private key from a signature.

```bash
node scripts/derive-private-key.js
```

## Usage Notes

1. Make sure all required environment variables are set in your `.env` file
2. For testing with different accounts, you can override the default admin wallet by setting:
   ```
   TEST_ACCOUNT_ADDRESS=0x123...
   TEST_ACCOUNT_PRIVATE_KEY=0x456...
   ```
3. Check the documentation in `docs/agent-creation-flow.md` for more details on the agent creation process 