// Script to debug signature validation issues
import { RpcProvider, ec, hash, encode, Account, CallData } from 'starknet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Constants
const NODE_URL = process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io';
const OZ_ACCOUNT_CLASS_HASH = '0x04d07e40e93398ed3c76981e72dd1fd22557a78ce36c0515f679e27f0bb5bc5f';

// The specific values from the error message
const PUBLIC_KEY = '0x44f2464381b75b773a01d5fd66d9da9dbfbc8a1eeb97e59c3a502bb6433819a';
const EXPECTED_ADDRESS = '0x654f5fbcc2ddb82ae30f90f8db7f169b44a935a6eeee341e7b11127f46bcab1';
const SIGNATURE = process.env.TEST_SIGNATURE || '0xe088fe2c...55bed8b41c'; // Replace with the actual signature

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

  // The Starknet curve order (n)
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
    fullKey: formattedKey
  });

  return formattedKey;
}

// Function to verify the address calculation
async function verifyAddressCalculation(privateKey, expectedPublicKey, expectedAddress) {
  console.log('\n🔄 Verifying address calculation...');
  
  // Calculate the public key from the private key
  const starkKeyPub = ec.starkCurve.getPublicKey(privateKey);
  
  // For Starknet, we need just the x-coordinate of the public key
  const publicKeyHex = encode.buf2hex(starkKeyPub);
  console.log(`Raw public key: ${publicKeyHex}`);
  
  // Extract the x-coordinate
  const xCoordinate = publicKeyHex.startsWith('0x') 
    ? publicKeyHex.slice(4, 4 + 64) 
    : publicKeyHex.slice(2, 2 + 64);
  
  // Format the x-coordinate with 0x prefix
  const formattedPublicKey = `0x${xCoordinate}`;
  console.log(`Formatted public key (x-coordinate): ${formattedPublicKey}`);
  
  // Check if the public key matches the expected one
  console.log(`Expected public key: ${expectedPublicKey}`);
  console.log(`Public keys match: ${formattedPublicKey.toLowerCase() === expectedPublicKey.toLowerCase()}`);
  
  // Convert to BigInt
  const publicKeyBigInt = BigInt(formattedPublicKey);
  
  // Create constructor calldata with the public key
  const constructorCalldata = CallData.compile({
    publicKey: publicKeyBigInt.toString()
  });
  
  // Calculate the contract address
  const address = hash.calculateContractAddressFromHash(
    publicKeyBigInt, // salt
    OZ_ACCOUNT_CLASS_HASH,
    constructorCalldata,
    0 // deployer address
  );
  
  // Format the address with 0x prefix
  const formattedAddress = '0x' + address.toString(16);
  console.log(`Calculated address: ${formattedAddress}`);
  console.log(`Expected address: ${expectedAddress}`);
  console.log(`Addresses match: ${formattedAddress.toLowerCase() === expectedAddress.toLowerCase()}`);
  
  return {
    publicKey: formattedPublicKey,
    address: formattedAddress,
    publicKeyMatches: formattedPublicKey.toLowerCase() === expectedPublicKey.toLowerCase(),
    addressMatches: formattedAddress.toLowerCase() === expectedAddress.toLowerCase()
  };
}

// Function to test signature validation
async function testSignatureValidation(privateKey, publicKey) {
  console.log('\n🔄 Testing signature validation...');
  
  try {
    // Create a test message
    const testMessage = "Test message for signature validation";
    console.log(`Test message: "${testMessage}"`);
    
    // Calculate the message hash
    const messageHash = hash.starknetKeccak(testMessage);
    console.log(`Message hash: ${messageHash}`);
    
    // Sign the message with the private key
    const signature = ec.starkCurve.sign(privateKey, messageHash);
    console.log(`Signature: [${signature[0].toString()}, ${signature[1].toString()}]`);
    
    // Verify the signature with the public key
    const isValid = ec.starkCurve.verify(publicKey, messageHash, signature);
    console.log(`Signature validation result: ${isValid ? 'Valid ✅' : 'Invalid ❌'}`);
    
    return isValid;
  } catch (error) {
    console.error('❌ Error in signature validation test:', error);
    return false;
  }
}

async function main() {
  try {
    console.log("🔄 Starting signature validation debug...");
    
    // Derive a private key from the signature
    const privateKey = deriveStarkKeyFromSignature(SIGNATURE);
    
    // Verify the address calculation
    const verificationResult = await verifyAddressCalculation(
      privateKey, 
      PUBLIC_KEY,
      EXPECTED_ADDRESS
    );
    
    // If the public key doesn't match, there's a problem with the key derivation
    if (!verificationResult.publicKeyMatches) {
      console.log('\n⚠️ WARNING: The derived public key does not match the expected public key!');
      console.log('This indicates a problem with the key derivation process.');
    }
    
    // If the address doesn't match, there's a problem with the address calculation
    if (!verificationResult.addressMatches) {
      console.log('\n⚠️ WARNING: The calculated address does not match the expected address!');
      console.log('This indicates a problem with the address calculation process.');
    }
    
    // Test signature validation
    const isSignatureValid = await testSignatureValidation(privateKey, verificationResult.publicKey);
    
    if (!isSignatureValid) {
      console.log('\n⚠️ WARNING: Signature validation failed!');
      console.log('This indicates a problem with the signature validation process.');
    }
    
    console.log('\n📊 Summary:');
    console.log('- Public key match:', verificationResult.publicKeyMatches ? '✅ Matched' : '❌ Mismatched');
    console.log('- Address match:', verificationResult.addressMatches ? '✅ Matched' : '❌ Mismatched');
    console.log('- Signature validation:', isSignatureValid ? '✅ Valid' : '❌ Invalid');
    
    // Connect to the provider to check if the account is already deployed
    console.log('\n🌐 Connecting to Starknet node...');
    const provider = new RpcProvider({ nodeUrl: NODE_URL });
    
    try {
      const accountClassHash = await provider.getClassHashAt(EXPECTED_ADDRESS);
      console.log(`✅ Account already deployed with class hash: ${accountClassHash}`);
    } catch {
      console.log(`❌ Account not deployed at address: ${EXPECTED_ADDRESS}`);
    }
    
  } catch (error) {
    console.error('❌ Error in debug script:', error.message);
  }
}

// Run the main function
main().catch(console.error); 