// Script to transfer funds from a Starknet account back to the admin wallet
import { RpcProvider, Account, Contract, uint256 } from 'starknet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Constants
const NODE_URL = process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io';
const ETH_TOKEN_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'; // Sepolia ETH token
const ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS;

// The account to transfer funds from
const ACCOUNT_ADDRESS = '0x6e60ce7000a9c0e6b4eaa2b874dd89e842f10a948576731f32363c2c3a51e1d';
const ACCOUNT_PRIVATE_KEY = process.env.TEST_ACCOUNT_PRIVATE_KEY; // Private key of the account

// Percentage of balance to transfer (95%)
const TRANSFER_PERCENTAGE = 0.95;

async function main() {
  try {
    console.log('🔄 Starting Starknet funds transfer...');
    console.log(`🌐 Connecting to node: ${NODE_URL}`);
    
    if (!ACCOUNT_PRIVATE_KEY) {
      console.error('❌ TEST_ACCOUNT_PRIVATE_KEY is not set in environment variables');
      return;
    }
    
    if (!ADMIN_WALLET_ADDRESS) {
      console.error('❌ ADMIN_WALLET_ADDRESS is not set in environment variables');
      return;
    }
    
    console.log(`📝 Source account: ${ACCOUNT_ADDRESS}`);
    console.log(`📝 Destination account: ${ADMIN_WALLET_ADDRESS}`);
    
    // Initialize provider
    const provider = new RpcProvider({ nodeUrl: NODE_URL });
    
    // Initialize account
    const account = new Account(provider, ACCOUNT_ADDRESS, ACCOUNT_PRIVATE_KEY);
    
    // Check if account exists
    try {
      const accountClassHash = await provider.getClassHashAt(ACCOUNT_ADDRESS);
      console.log(`✅ Account exists with class hash: ${accountClassHash}`);
    } catch {
      console.error('❌ Account does not exist or is not deployed');
      return;
    }
    
    // Check ETH balance
    console.log('💰 Checking ETH balance...');
    try {
      const result = await provider.callContract({
        contractAddress: ETH_TOKEN_ADDRESS,
        entrypoint: 'balanceOf',
        calldata: [ACCOUNT_ADDRESS]
      });
      
      console.log('📊 Raw balance response:', result);
      
      if (result && result.length >= 2) {
        // ERC20 balances in Starknet are returned as Uint256 (low, high)
        const low = BigInt(result[0]);
        const high = BigInt(result[1]);
        const balance = (high << 128n) + low;
        
        // Format the balance in different units
        const balanceInWei = balance.toString();
        const balanceInGwei = Number(balance) / 10**9;
        const balanceInEth = Number(balance) / 10**18;
        
        console.log('💰 Current account balance:');
        console.log(`- Wei: ${balanceInWei}`);
        console.log(`- Gwei: ${balanceInGwei.toFixed(9)}`);
        console.log(`- ETH: ${balanceInEth.toFixed(18)}`);
        
        // Calculate 95% of the balance
        const transferAmount = balance * BigInt(TRANSFER_PERCENTAGE * 100) / BigInt(100);
        
        // Keep some ETH for gas fees (at least 0.0005 ETH)
        const minKeepAmount = 500000000000000n; // 0.0005 ETH in wei
        
        // Ensure we're not transferring too much
        const finalTransferAmount = balance - transferAmount < minKeepAmount 
          ? balance - minKeepAmount 
          : transferAmount;
        
        // Don't transfer if balance is too low
        if (balance <= minKeepAmount) {
          console.log('⚠️ Balance too low to transfer, keeping all funds for gas');
          return;
        }
        
        console.log('💸 Transferring 95% of balance:');
        console.log(`- Amount in Wei: ${finalTransferAmount.toString()}`);
        console.log(`- Amount in ETH: ${Number(finalTransferAmount) / 10**18}`);
        
        // Convert to Uint256
        const amountUint256 = uint256.bnToUint256(finalTransferAmount);
        
        // Execute transfer
        console.log('🚀 Executing transfer...');
        const { transaction_hash } = await account.execute({
          contractAddress: ETH_TOKEN_ADDRESS,
          entrypoint: 'transfer',
          calldata: [
            ADMIN_WALLET_ADDRESS,
            amountUint256.low.toString(),
            amountUint256.high.toString()
          ]
        });
        
        console.log('💸 Transfer transaction sent:', transaction_hash);
        
        // Wait for transaction acceptance
        console.log('⏳ Waiting for transaction acceptance...');
        await provider.waitForTransaction(transaction_hash);
        console.log('✅ Transfer transaction accepted');
        
        // Check new balance
        const newResult = await provider.callContract({
          contractAddress: ETH_TOKEN_ADDRESS,
          entrypoint: 'balanceOf',
          calldata: [ACCOUNT_ADDRESS]
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
    console.error('❌ Error in transfer script:', error.message);
  }
}

// Run the main function
main().catch(console.error); 