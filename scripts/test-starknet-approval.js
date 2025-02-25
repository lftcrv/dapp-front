// Script to test Starknet transaction approval using a derived private key
import { RpcProvider, Account, Contract, CallData, stark, ec, hash, encode } from 'starknet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Constants
const NODE_URL = process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io';
const TEST_PRIVATE_KEY = '0x1e4fcd3b1ecd473d5393d9636435394b77da34df77e9474db337f4e980d16d2'; // Test private key
const TEST_SIGNATURE = process.env.TEST_SIGNATURE; // Optional: signature to derive key from

// Function to derive Starknet private key from signature
function deriveStarkKeyFromSignature(signature) {
  console.log('🔍 Processing signature for key derivation:', {
    signatureLength: signature.length,
    signaturePreview: `${signature.slice(0, 10)}...${signature.slice(-10)}`,
  });

  // Remove '0x' prefix if present
  const cleanSignature = signature.startsWith('0x')
    ? signature.slice(2)
    : signature;

  // The Starknet curve order (n)
  const curveOrder = BigInt(
    '0x0800000000000010ffffffffffffffffb781126dcae7b2321e66a241adc64d2f',
  );

  // Generate a deterministic but valid private key
  const hashedSignature = hash.starknetKeccak(cleanSignature).toString(16);
  
  // Convert to BigInt and ensure it's within the valid range by taking modulo
  const privateKeyBigInt = BigInt(`0x${hashedSignature}`);

  // Ensure the key is less than the curve order but greater than 1
  const validPrivateKey = (
    (privateKeyBigInt % (curveOrder - BigInt(2))) +
    BigInt(1)
  ).toString(16);

  // Ensure the key is properly formatted with 0x prefix
  const formattedKey = `0x${validPrivateKey}`;

  console.log('🔑 Derived private key:', {
    preview: `${formattedKey.slice(0, 10)}...${formattedKey.slice(-10)}`,
  });

  return formattedKey;
}

// Function to get account address from private key
async function getAccountAddress(privateKey) {
  // Calculate the public key from the private key
  const starkKeyPub = ec.starkCurve.getPublicKey(privateKey);
  
  // For Starknet, we need just the x-coordinate of the public key
  const publicKeyHex = encode.buf2hex(starkKeyPub);
  
  // Extract the x-coordinate
  const xCoordinate = publicKeyHex.startsWith('0x') 
    ? publicKeyHex.slice(4, 4 + 64) 
    : publicKeyHex.slice(2, 2 + 64);
  
  // Format the x-coordinate with 0x prefix
  const formattedPublicKey = `0x${xCoordinate}`;
  
  // Convert to BigInt
  const publicKeyBigInt = BigInt(formattedPublicKey);
  
  // Create constructor calldata with the public key
  const constructorCalldata = CallData.compile({
    publicKey: publicKeyBigInt.toString()
  });
  
  // Calculate the contract address
  const OZ_ACCOUNT_CLASS_HASH = '0x04d07e40e93398ed3c76981e72dd1fd22557a78ce36c0515f679e27f0bb5bc5f';
  const address = hash.calculateContractAddressFromHash(
    publicKeyBigInt, // salt
    OZ_ACCOUNT_CLASS_HASH,
    constructorCalldata,
    0 // deployer address
  );
  
  // Format the address with 0x prefix
  return '0x' + address.toString(16);
}

// Function to simulate an approval transaction
async function simulateApproval(privateKey, spenderAddress, tokenAmount) {
  try {
    console.log('🔄 Simulating approval transaction...');
    
    // Initialize provider
    const provider = new RpcProvider({ nodeUrl: NODE_URL });
    console.log(`🌐 Connected to node: ${NODE_URL}`);
    
    // Get the account address
    const accountAddress = await getAccountAddress(privateKey);
    console.log(`📝 Account address: ${accountAddress}`);
    
    // Initialize account
    const account = new Account(provider, accountAddress, privateKey);
    
    // Check if account exists
    try {
      const accountClassHash = await provider.getClassHashAt(accountAddress);
      console.log(`✅ Account exists with class hash: ${accountClassHash}`);
    } catch {
      console.error('❌ Account not deployed');
      return { success: false, error: 'Account not deployed' };
    }
    
    // ERC20 token address (using ETH for testing)
    const tokenAddress = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
    
    // Check balance before approval
    console.log('💰 Checking token balance...');
    const balanceResult = await provider.callContract({
      contractAddress: tokenAddress,
      entrypoint: 'balanceOf',
      calldata: [accountAddress]
    });
    
    if (balanceResult && balanceResult.length >= 2) {
      const low = BigInt(balanceResult[0]);
      const high = BigInt(balanceResult[1]);
      const balance = (high << 128n) + low;
      
      console.log(`💰 Token balance: ${balance.toString()} wei (${Number(balance) / 10**18} ETH)`);
      
      if (balance === 0n) {
        console.warn('⚠️ Account has zero balance, approval may fail');
      }
    }
    
    // Simulate the approval transaction
    console.log(`🔄 Simulating approval of ${tokenAmount} tokens to ${spenderAddress}...`);
    
    // Convert amount to uint256
    const amountLow = tokenAmount.toString();
    const amountHigh = '0';
    
    try {
      // Estimate fee for the approval
      const { suggestedMaxFee } = await account.estimateInvokeFee({
        contractAddress: tokenAddress,
        entrypoint: 'approve',
        calldata: [spenderAddress, amountLow, amountHigh]
      });
      
      console.log(`💰 Estimated fee: ${suggestedMaxFee.toString()} wei (${Number(suggestedMaxFee) / 10**18} ETH)`);
      
      // Simulate the transaction (don't actually execute it)
      console.log('✅ Approval simulation successful');
      console.log('📝 Transaction details:', {
        from: accountAddress,
        to: tokenAddress,
        method: 'approve',
        params: {
          spender: spenderAddress,
          amount: tokenAmount.toString()
        },
        estimatedFee: suggestedMaxFee.toString()
      });
      
      return { 
        success: true, 
        accountAddress,
        estimatedFee: suggestedMaxFee.toString(),
        balance: balanceResult ? balanceResult[0] : '0'
      };
    } catch (error) {
      console.error('❌ Approval simulation failed:', error.message);
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error('❌ Error in approval simulation:', error);
    return { success: false, error: error.message };
  }
}

// Function to execute an approval transaction
async function executeApproval(privateKey, spenderAddress, tokenAmount) {
  try {
    console.log('🔄 Executing approval transaction...');
    
    // Initialize provider
    const provider = new RpcProvider({ nodeUrl: NODE_URL });
    
    // Get the account address
    const accountAddress = await getAccountAddress(privateKey);
    console.log(`📝 Account address: ${accountAddress}`);
    
    // Initialize account
    const account = new Account(provider, accountAddress, privateKey);
    
    // ERC20 token address (using ETH for testing)
    const tokenAddress = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
    
    // Convert amount to uint256
    const amountLow = tokenAmount.toString();
    const amountHigh = '0';
    
    // Execute the approval transaction
    console.log(`🔄 Approving ${tokenAmount} tokens to ${spenderAddress}...`);
    
    const { transaction_hash } = await account.execute({
      contractAddress: tokenAddress,
      entrypoint: 'approve',
      calldata: [spenderAddress, amountLow, amountHigh]
    });
    
    console.log(`✅ Approval transaction sent: ${transaction_hash}`);
    
    // Wait for transaction acceptance
    console.log('⏳ Waiting for transaction acceptance...');
    await provider.waitForTransaction(transaction_hash);
    console.log('✅ Approval transaction accepted');
    
    return { 
      success: true, 
      txHash: transaction_hash,
      accountAddress
    };
  } catch (error) {
    console.error('❌ Error in approval execution:', error);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  try {
    console.log("🔄 Starting Starknet approval test...");
    
    // Use provided signature or test private key
    let privateKey = TEST_PRIVATE_KEY;
    
    if (TEST_SIGNATURE) {
      console.log('🔑 Using signature to derive private key...');
      privateKey = deriveStarkKeyFromSignature(TEST_SIGNATURE);
    } else {
      console.log('🔑 Using test private key:', {
        preview: `${privateKey.slice(0, 10)}...${privateKey.slice(-10)}`
      });
    }
    
    // Test spender address (replace with your contract address)
    const spenderAddress = '0x01e2F67d8132831f210E19c5Ee0197aA134308e16F7f284bBa2c72E28FC464D2';
    
    // Test token amount (1 token with 18 decimals)
    const tokenAmount = 1000000000000000000n;
    
    // First simulate the approval
    const simulationResult = await simulateApproval(privateKey, spenderAddress, tokenAmount);
    
    if (simulationResult.success) {
      console.log('✅ Approval simulation successful');
      
      // Ask if user wants to execute the actual transaction
      console.log('\n⚠️ Do you want to execute the actual approval transaction? (y/n)');
      console.log('Press Ctrl+C to cancel or wait 5 seconds to automatically skip execution');
      
      // Wait for 5 seconds then skip execution
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('⏭️ Skipping actual execution for safety');
      
      // Uncomment the following to execute the actual transaction
      // const executionResult = await executeApproval(privateKey, spenderAddress, tokenAmount);
      // if (executionResult.success) {
      //   console.log('✅ Approval execution successful');
      //   console.log(`Transaction hash: ${executionResult.txHash}`);
      // } else {
      //   console.error('❌ Approval execution failed:', executionResult.error);
      // }
    } else {
      console.error('❌ Approval simulation failed:', simulationResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error in test script:', error.message);
  }
}

// Run the main function
main().catch(console.error); 