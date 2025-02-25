// Script to test agent approval flow
import dotenv from 'dotenv';
import { approveTokens } from '../actions/shared/starknet-transactions';

// Load environment variables
dotenv.config();

// Constants
const TEST_EVM_ADDRESS = process.env.TEST_EVM_ADDRESS || '0x123...'; // Replace with a test EVM address
const TEST_STARKNET_ADDRESS = process.env.TEST_STARKNET_ADDRESS; // Optional: for testing Starknet wallet flow
const AGENT_CONTRACT_ADDRESS = process.env.AGENT_CONTRACT_ADDRESS || '0x01e2F67d8132831f210E19c5Ee0197aA134308e16F7f284bBa2c72E28FC464D2';
const ETH_TOKEN_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
const APPROVAL_AMOUNT = '1000000000000000000'; // 1 ETH in wei

// Main function
async function main() {
  try {
    console.log("🔄 Starting agent approval test...");
    
    // Note: This script won't work directly because server actions can only be called from:
    // 1. Client components in the browser
    // 2. Other server actions
    
    // For demonstration purposes, we'll show how the function would be called
    console.log("\n📝 Implementation Plan:");
    console.log("1. Create a client component that calls approveTokens");
    console.log("2. Add this component to the create-agent page");
    console.log("3. Test the functionality in the browser");
    
    console.log("\n🔍 For EVM wallets:");
    console.log("- When a user connects with an EVM wallet, we'll use the derived private key");
    console.log("- The approveWithEvmSignature function will handle the transaction");
    console.log("- No user interaction required for the approval");
    
    console.log("\n🔍 For Starknet wallets:");
    console.log("- When a user connects with a Starknet wallet, we'll use the wallet's signing capabilities");
    console.log("- The frontend will handle the transaction using the wallet's API");
    
    // Example of how the function would be called (this won't actually work in a script)
    console.log("\n📋 Example function call:");
    console.log(`
// For EVM wallet:
const evmResult = await approveTokens(
  'evm',
  '${TEST_EVM_ADDRESS}',
  '${AGENT_CONTRACT_ADDRESS}',
  '${ETH_TOKEN_ADDRESS}',
  '${APPROVAL_AMOUNT}'
);

// For Starknet wallet:
const starknetResult = await approveTokens(
  'starknet',
  '${TEST_STARKNET_ADDRESS || '0x123...'}',
  '${AGENT_CONTRACT_ADDRESS}',
  '${ETH_TOKEN_ADDRESS}',
  '${APPROVAL_AMOUNT}'
);
    `);
    
  } catch (error) {
    console.error('❌ Error in test script:', error instanceof Error ? error.message : String(error));
  }
}

// Run the main function
main().catch(error => console.error('❌ Unhandled error:', error instanceof Error ? error.message : String(error))); 