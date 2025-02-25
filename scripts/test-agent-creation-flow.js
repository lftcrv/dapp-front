// Script to test the complete agent creation flow
import { RpcProvider, Account, Contract, uint256 } from 'starknet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Constants from existing environment variables
const NODE_URL = process.env.NEXT_PUBLIC_NODE_URL || 'https://starknet-sepolia.public.blastapi.io';
const ETH_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_ETH_TOKEN_ADDRESS || '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'; // Sepolia ETH token
const DEPLOYMENT_FEES_RECIPIENT = process.env.NEXT_PUBLIC_DEPLOYMENT_FEES_RECIPIENT;
const DEPLOYMENT_FEES = process.env.NEXT_PUBLIC_DEPLOYMENT_FEES;

// For testing, we'll use the admin wallet by default
// This can be overridden by setting TEST_ACCOUNT_ADDRESS and TEST_ACCOUNT_PRIVATE_KEY
const TEST_ACCOUNT_ADDRESS = process.env.TEST_ACCOUNT_ADDRESS || process.env.ADMIN_WALLET_ADDRESS;
const TEST_ACCOUNT_PRIVATE_KEY = process.env.TEST_ACCOUNT_PRIVATE_KEY || process.env.ADMIN_WALLET_PK;

// Simulate different wallet types
const WALLET_TYPE = process.env.TEST_WALLET_TYPE || 'starknet'; // 'starknet' or 'evm'

async function main() {
  try {
    console.log('🔄 Starting agent creation flow test...');
    console.log(`🌐 Connecting to node: ${NODE_URL}`);
    console.log(`👛 Wallet type: ${WALLET_TYPE.toUpperCase()}`);
    
    // Validate required environment variables
    if (!TEST_ACCOUNT_PRIVATE_KEY) {
      console.error('❌ No private key available. Set either ADMIN_WALLET_PK or TEST_ACCOUNT_PRIVATE_KEY');
      return;
    }
    
    if (!TEST_ACCOUNT_ADDRESS) {
      console.error('❌ No account address available. Set either ADMIN_WALLET_ADDRESS or TEST_ACCOUNT_ADDRESS');
      return;
    }
    
    if (!DEPLOYMENT_FEES_RECIPIENT) {
      console.error('❌ NEXT_PUBLIC_DEPLOYMENT_FEES_RECIPIENT is not set in environment variables');
      return;
    }
    
    if (!DEPLOYMENT_FEES) {
      console.error('❌ NEXT_PUBLIC_DEPLOYMENT_FEES is not set in environment variables');
      return;
    }
    
    console.log(`📝 Source account: ${TEST_ACCOUNT_ADDRESS}`);
    console.log(`📝 Deployment fees recipient: ${DEPLOYMENT_FEES_RECIPIENT}`);
    console.log(`📝 Deployment fees amount: ${DEPLOYMENT_FEES} (${Number(DEPLOYMENT_FEES) / 10**18} ETH)`);
    
    // Initialize provider
    const provider = new RpcProvider({ nodeUrl: NODE_URL });
    
    // Initialize account
    const account = new Account(provider, TEST_ACCOUNT_ADDRESS, TEST_ACCOUNT_PRIVATE_KEY);
    
    // Check if account exists
    try {
      const accountClassHash = await provider.getClassHashAt(TEST_ACCOUNT_ADDRESS);
      console.log(`✅ Account exists with class hash: ${accountClassHash}`);
    } catch (error) {
      console.error('❌ Account does not exist or is not deployed:', error.message);
      return;
    }
    
    // Check ETH balance
    console.log('💰 Checking ETH balance...');
    try {
      const result = await provider.callContract({
        contractAddress: ETH_TOKEN_ADDRESS,
        entrypoint: 'balanceOf',
        calldata: [TEST_ACCOUNT_ADDRESS]
      });
      
      if (result && result.length >= 2) {
        // ERC20 balances in Starknet are returned as Uint256 (low, high)
        const low = BigInt(result[0]);
        const high = BigInt(result[1]);
        const balance = (high << 128n) + low;
        
        // Format the balance in different units
        const balanceInWei = balance.toString();
        const balanceInEth = Number(balance) / 10**18;
        
        console.log('💰 Current account balance:');
        console.log(`- Wei: ${balanceInWei}`);
        console.log(`- ETH: ${balanceInEth.toFixed(18)}`);
        
        // Check if balance is sufficient
        const deploymentFeesBigInt = BigInt(DEPLOYMENT_FEES);
        if (balance < deploymentFeesBigInt) {
          console.error(`❌ Insufficient balance: ${balanceInEth} ETH. Need at least ${Number(deploymentFeesBigInt) / 10**18} ETH`);
          return;
        }
        
        console.log('💸 Transferring deployment fees:');
        console.log(`- Amount in Wei: ${deploymentFeesBigInt.toString()}`);
        console.log(`- Amount in ETH: ${Number(deploymentFeesBigInt) / 10**18}`);
        
        // Convert to Uint256
        const amountUint256 = uint256.bnToUint256(deploymentFeesBigInt);
        
        // Execute transfer (simulating the agent creation flow)
        console.log('🚀 Executing transfer...');
        
        // This is similar to the transferCall in the create-agent page
        const { transaction_hash } = await account.execute({
          contractAddress: ETH_TOKEN_ADDRESS,
          entrypoint: 'transfer',
          calldata: [
            DEPLOYMENT_FEES_RECIPIENT,
            amountUint256.low.toString(),
            amountUint256.high.toString()
          ]
        });
        
        console.log('💸 Transfer transaction sent:', transaction_hash);
        
        // Wait for transaction acceptance
        console.log('⏳ Waiting for transaction acceptance...');
        await provider.waitForTransaction(transaction_hash);
        console.log('✅ Transfer transaction accepted');
        
        // Simulate the agent creation process
        console.log('🤖 Simulating agent creation process...');
        console.log('📝 Agent details:');
        console.log('- Name: Test Agent');
        console.log('- Curve Side: LEFT');
        console.log('- Creator Wallet:', TEST_ACCOUNT_ADDRESS);
        console.log('- Transaction Hash:', transaction_hash);
        
        // Simulate API call
        console.log('🔄 Simulating API call to create agent...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        console.log('✅ Agent created successfully!');
        console.log('🔄 In the actual flow, the user would be redirected to the home page');
        
        // Check new balance
        const newResult = await provider.callContract({
          contractAddress: ETH_TOKEN_ADDRESS,
          entrypoint: 'balanceOf',
          calldata: [TEST_ACCOUNT_ADDRESS]
        });
        
        if (newResult && newResult.length >= 2) {
          const newLow = BigInt(newResult[0]);
          const newHigh = BigInt(newResult[1]);
          const newBalance = (newHigh << 128n) + newLow;
          
          console.log('💰 New account balance:');
          console.log(`- Wei: ${newBalance.toString()}`);
          console.log(`- ETH: ${Number(newBalance) / 10**18}`);
        }
      } else {
        console.warn('⚠️ Unexpected balance response structure:', result);
      }
    } catch (error) {
      console.error('❌ Error during transfer process:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error in test script:', error.message);
  }
}

// Run the main function
main().catch(console.error); 