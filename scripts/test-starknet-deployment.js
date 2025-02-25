// Test script for Starknet account deployment
import { RpcProvider, ec, hash, encode, Account, CallData } from 'starknet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Constants for account deployment
const NODE_URL = process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io';
const OZ_ACCOUNT_CLASS_HASH = '0x04d07e40e93398ed3c76981e72dd1fd22557a78ce36c0515f679e27f0bb5bc5f';
const SIGNATURE = process.env.TEST_SIGNATURE || '0x1234567890abcdef'; // Replace with your signature
const FUND_AMOUNT = 10000000000000000n; // 0.01 ETH in wei
const ETH_TOKEN_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'; // Sepolia ETH token

// Admin wallet for funding (from environment variables)
const ADMIN_PRIVATE_KEY = process.env.ADMIN_WALLET_PK;
const ADMIN_ADDRESS = process.env.ADMIN_WALLET_ADDRESS;

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
  console.log('✅ Cleaned signature:', {
    length: cleanSignature.length,
    preview: `${cleanSignature.slice(0, 10)}...${cleanSignature.slice(-10)}`,
  });

  // The Starknet curve order (n) is 0x0800000000000010ffffffffffffffffb781126dcae7b2321e66a241adc64d2f
  const curveOrder = BigInt(
    '0x0800000000000010ffffffffffffffffb781126dcae7b2321e66a241adc64d2f',
  );

  // Generate a deterministic but valid private key
  // Use a simple approach: hash the signature with starknetKeccak and ensure it's within range
  const hashedSignature = hash.starknetKeccak(cleanSignature).toString(16);
  console.log('📊 Hashed signature:', {
    hash: hashedSignature,
    preview: `${hashedSignature.slice(0, 10)}...${hashedSignature.slice(-10)}`,
  });

  // Convert to BigInt and ensure it's within the valid range by taking modulo
  const privateKeyBigInt = BigInt(`0x${hashedSignature}`);

  // Ensure the key is less than the curve order but greater than 1
  // This is critical for Starknet key validity
  const validPrivateKey = (
    (privateKeyBigInt % (curveOrder - BigInt(2))) +
    BigInt(1)
  ).toString(16);

  // Ensure the key is properly formatted with 0x prefix
  const formattedKey = `0x${validPrivateKey}`;

  console.log('🔑 Derived private key:', {
    preview: `${formattedKey.slice(0, 10)}...${formattedKey.slice(-10)}`,
  });

  // Validate the key by attempting to derive a public key
  try {
    const publicKey = ec.starkCurve.getPublicKey(formattedKey);
    const pubKeyHex = encode.buf2hex(publicKey);

    // Also check if the public key is within the valid range
    const pubKeyBigInt = BigInt(
      pubKeyHex.startsWith('0x') ? pubKeyHex : `0x${pubKeyHex}`,
    );

    // If the public key is too large, we need to generate a different private key
    if (pubKeyBigInt >= curveOrder) {
      console.warn(
        '⚠️ Derived public key is too large, generating alternative key',
      );

      // Use a different seed to generate a new private key
      const altSeed = 'starknet_alt_' + signature;
      const altHash = hash.starknetKeccak(altSeed).toString(16);
      const altPrivateKeyBigInt = BigInt(`0x${altHash}`);
      const altValidPrivateKey = (
        (altPrivateKeyBigInt % (curveOrder - BigInt(2))) +
        BigInt(1)
      ).toString(16);
      const altFormattedKey = `0x${altValidPrivateKey}`;

      // Verify this key produces a valid public key
      const altPublicKey = ec.starkCurve.getPublicKey(altFormattedKey);
      const altPubKeyHex = encode.buf2hex(altPublicKey);
      const altPubKeyBigInt = BigInt(
        altPubKeyHex.startsWith('0x') ? altPubKeyHex : `0x${altPubKeyHex}`,
      );

      if (altPubKeyBigInt < curveOrder) {
        console.log('✅ Alternative key validation successful:', {
          publicKeyPreview:
            altPubKeyHex.slice(0, 10) + '...' + altPubKeyHex.slice(-10),
        });
        return altFormattedKey;
      } else {
        console.warn(
          '⚠️ Alternative key also produced invalid public key, using original with modulo',
        );
      }
    }

    console.log('✅ Key validation successful - public key derived:', {
      publicKeyPreview: pubKeyHex.slice(0, 10) + '...' + pubKeyHex.slice(-10),
    });
    return formattedKey;
  } catch (validationError) {
    console.error('❌ Key validation failed:', validationError);
    throw new Error('Generated key failed validation');
  }
}

// Function to fund an account with ETH
async function fundAccount(provider, recipientAddress, amount) {
  if (!ADMIN_PRIVATE_KEY || !ADMIN_ADDRESS) {
    console.log('⚠️ Admin wallet not configured, skipping funding step');
    return false;
  }
  
  try {
    console.log(`💰 Funding account ${recipientAddress} with ${amount} wei...`);
    
    // Initialize admin account
    const adminAccount = new Account(provider, ADMIN_ADDRESS, ADMIN_PRIVATE_KEY);
    
    // Execute transfer
    const { transaction_hash } = await adminAccount.execute({
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: 'transfer',
      calldata: [
        recipientAddress,
        amount.toString(),
        '0' // For amounts less than 2^128
      ]
    });
    
    console.log('💸 Funding transaction sent:', transaction_hash);
    
    // Wait for transaction acceptance
    await provider.waitForTransaction(transaction_hash);
    console.log('✅ Funding transaction accepted');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to fund account:', error.message);
    return false;
  }
}

// Function to deploy an account using a different approach
async function deployAccount(provider, privateKey, publicKeyBigInt) {
  console.log("Deploying account...");
  
  try {
    // Create constructor calldata with the public key
    const constructorCalldata = CallData.compile({
      publicKey: publicKeyBigInt.toString()
    });
    
    // Calculate the contract address
    const accountAddress = hash.calculateContractAddressFromHash(
      publicKeyBigInt, // salt
      OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0 // deployer address
    );
    console.log(`Account address: ${accountAddress}`);
    
    // Check if the account is already deployed
    const accountDeployed = await isAccountDeployed(provider, accountAddress);
    if (accountDeployed) {
      console.log("Account already deployed");
      return { success: true, accountAddress };
    }
    
    // Create an account instance with the derived private key
    const account = new Account(
      provider,
      accountAddress,
      privateKey
    );
    
    // Set a higher max fee to ensure deployment succeeds
    const maxFee = 5000000000000000n; // 0.005 ETH
    console.log(`Setting max fee for deployment: ${maxFee}`);
    
    // Log deployment parameters for debugging
    console.log("Deployment parameters:", {
      classHash: OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata: constructorCalldata,
      addressSalt: publicKeyBigInt.toString(),
      chainId: provider.chainId
    });
    
    // Deploy the account
    const deployResponse = await account.deployAccount({
      classHash: OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      addressSalt: publicKeyBigInt,
      maxFee
    });
    
    console.log(`Account deployment transaction hash: ${deployResponse.transaction_hash}`);
    
    // Wait for the transaction to be accepted
    await provider.waitForTransaction(deployResponse.transaction_hash);
    console.log("Account deployment successful!");
    
    return { success: true, accountAddress, txHash: deployResponse.transaction_hash };
  } catch (error) {
    console.error("Error deploying account:", error);
    return { success: false, error };
  }
}

/**
 * Check if an account is already deployed at the given address
 */
async function isAccountDeployed(provider, address) {
  try {
    const accountClassHash = await provider.getClassHashAt(address);
    console.log(`✅ Account already deployed with class hash: ${accountClassHash}`);
    return true;
  } catch {
    console.log(`📊 Account not deployed yet at address: ${address}`);
    return false;
  }
}

async function main() {
  try {
    console.log("🔄 Starting Starknet account deployment test...");
    console.log(`🌐 Connecting to node: ${NODE_URL}`);
    
    const provider = new RpcProvider({ nodeUrl: NODE_URL });
    
    // Use the signature to derive a private key
    console.log(`Using signature: ${SIGNATURE}`);
    
    // Derive a private key from the signature using the same method as the front-end
    const privateKey = deriveStarkKeyFromSignature(SIGNATURE);
    console.log(`Derived private key: ${privateKey.slice(0, 10)}...${privateKey.slice(-10)}`);
    
    // Calculate the public key from the private key
    const starkKeyPub = ec.starkCurve.getPublicKey(privateKey);
    
    // For Starknet, we need just the x-coordinate of the public key
    // The public key from starkCurve.getPublicKey is in compressed format (04 + x-coordinate + y-coordinate)
    // We need to extract just the x-coordinate
    const publicKeyHex = encode.buf2hex(starkKeyPub);
    console.log(`Raw public key: ${publicKeyHex}`);
    
    // Extract the x-coordinate (remove the '04' prefix and take the first half)
    // The public key is in format: 04 + x-coordinate (64 bytes) + y-coordinate (64 bytes)
    const xCoordinate = publicKeyHex.startsWith('0x') 
      ? publicKeyHex.slice(4, 4 + 64) 
      : publicKeyHex.slice(2, 2 + 64);
    
    // Format the x-coordinate with 0x prefix
    const formattedPublicKey = `0x${xCoordinate}`;
    console.log(`Formatted public key (x-coordinate): ${formattedPublicKey}`);
    
    // Convert to BigInt
    const publicKeyBigInt = BigInt(formattedPublicKey);
    console.log(`Public key as BigInt: ${publicKeyBigInt}`);
    
    // Calculate the account address
    const constructorCalldata = CallData.compile({
      publicKey: publicKeyBigInt.toString(),
    });
    
    // Calculate the pre-computed address using the recommended approach
    const address = hash.calculateContractAddressFromHash(
      publicKeyBigInt,
      OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0
    );
    
    const formattedAddress = encode.addHexPrefix(address.toString(16));
    console.log('📝 Calculated account address:', formattedAddress);
    
    // Check if the account is already deployed
    const accountDeployed = await isAccountDeployed(provider, formattedAddress);
    
    if (!accountDeployed) {
      // Fund the account with a higher amount to cover deployment costs
      const funded = await fundAccount(provider, formattedAddress, FUND_AMOUNT);
      
      if (funded) {
        // Deploy the account
        const deploymentResult = await deployAccount(
          provider,
          privateKey,
          publicKeyBigInt
        );
        
        if (deploymentResult.success) {
          console.log('🎉 Account deployed successfully!');
          console.log('- Address:', formattedAddress);
          console.log('- Transaction hash:', deploymentResult.txHash);
        } else {
          console.log('❌ Account deployment failed:', deploymentResult.error);
        }
      } else {
        console.log('❌ Failed to fund the account, cannot proceed with deployment');
      }
    } else {
      console.log('✅ Account already deployed at address:', formattedAddress);
      console.log('- No need to deploy again');
      console.log('- Class Hash:', OZ_ACCOUNT_CLASS_HASH);
      console.log('- Constructor Calldata:', JSON.stringify(constructorCalldata));
      console.log('- Address Salt:', publicKeyBigInt.toString());
      console.log('- Max Fee: 5000000000000000 (0.005 ETH)');
    }
  } catch (error) {
    console.log('❌ Error in deployment test:', error.message);
  }
}

// Run the main function
main().catch(console.error); 