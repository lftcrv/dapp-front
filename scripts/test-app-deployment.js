// Script to test the application's deployment process
// Using CommonJS require instead of ES modules
const dotenv = require('dotenv');
const { fundAndDeployWallet } = require('../actions/shared/deploy-starknet-wallet');

// Load environment variables
dotenv.config();

// Test private key - this would normally be derived from a signature
// Using the same key as in the test-starknet-deployment.js for comparison
const TEST_PRIVATE_KEY = '0x1e4fcd3b1ecd473d5393d9636435394b77da34df77e9474db337f4e980d16d2';

async function main() {
  try {
    console.log('🔄 Testing application deployment process...');
    console.log(`Using private key: ${TEST_PRIVATE_KEY.slice(0, 10)}...${TEST_PRIVATE_KEY.slice(-10)}`);
    
    // Call the fundAndDeployWallet function
    console.log('Calling fundAndDeployWallet...');
    const result = await fundAndDeployWallet(TEST_PRIVATE_KEY);
    
    console.log('\n📊 Deployment Result:');
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('Address:', result.address);
      console.log('Transaction Hash:', result.txHash || 'N/A (already deployed)');
    } else {
      console.error('Error:', result.error);
    }
    
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Error in test script:', error);
  }
}

// Run the main function
main().catch(console.error); 