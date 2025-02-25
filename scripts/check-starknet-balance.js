// Script to check the balance of a Starknet account
import { RpcProvider, Contract, uint256, hash } from 'starknet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Constants
const NODE_URL = process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io';
const ETH_TOKEN_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'; // Sepolia ETH token

// The account address to check
const ACCOUNT_ADDRESS = '0x29bf1029b72bdb9b0f2913bc1e2243f439c521337c4f14df86dc0ee67b4c7c0';

async function main() {
  try {
    console.log('🔄 Starting Starknet balance check...');
    console.log(`🌐 Connecting to node: ${NODE_URL}`);
    console.log(`📝 Checking account: ${ACCOUNT_ADDRESS}`);
    
    // Initialize provider
    const provider = new RpcProvider({ nodeUrl: NODE_URL });
    
    // Check if account exists
    try {
      const accountClassHash = await provider.getClassHashAt(ACCOUNT_ADDRESS);
      console.log(`✅ Account exists with class hash: ${accountClassHash}`);
    } catch {
      console.log('❌ Account does not exist or is not deployed');
      return;
    }
    
    // Check ETH balance using the call method
    console.log('💰 Checking ETH balance...');
    try {
      // Calculate storage key for the balance
      // For the ERC20 balance, we need to call the balanceOf function
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
        
        console.log('💰 Account balance:');
        console.log(`- Wei: ${balanceInWei}`);
        console.log(`- Gwei: ${balanceInGwei.toFixed(9)}`);
        console.log(`- ETH: ${balanceInEth.toFixed(18)}`);
      } else {
        console.warn('⚠️ Unexpected balance response structure:', result);
      }
    } catch (error) {
      console.error('❌ Error checking balance:', error.message);
    }
    
    // Get transaction count
    try {
      const nonce = await provider.getNonceForAddress(ACCOUNT_ADDRESS);
      console.log(`📝 Account nonce (transaction count): ${nonce}`);
    } catch (error) {
      console.error('❌ Error getting nonce:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error in balance check:', error.message);
  }
}

// Run the main function
main().catch(console.error); 