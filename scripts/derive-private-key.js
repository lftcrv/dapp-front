// Script to derive a Starknet private key from a signature
import { hash, ec, encode } from 'starknet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Constants
const STARKNET_CURVE_ORDER = '0x0800000000000010ffffffffffffffffb781126dcae7b2321e66a241adc64d2f';

// The signature to derive the key from
const SIGNATURE = process.env.TEST_SIGNATURE || '0x1234567890abcdef'; // Replace with your signature

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
  const curveOrder = BigInt(STARKNET_CURVE_ORDER);

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
          fullKey: altFormattedKey
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
    
    // Calculate the account address
    const xCoordinate = pubKeyHex.startsWith('0x') 
      ? pubKeyHex.slice(4, 4 + 64) 
      : pubKeyHex.slice(2, 2 + 64);
    
    // Format the x-coordinate with 0x prefix
    const formattedPublicKey = `0x${xCoordinate}`;
    console.log(`Formatted public key (x-coordinate): ${formattedPublicKey}`);
    
    // Convert to BigInt
    const publicKeyBigInt = BigInt(formattedPublicKey);
    
    // Calculate the account address
    const constructorCalldata = [publicKeyBigInt.toString()];
    const OZ_ACCOUNT_CLASS_HASH = '0x04d07e40e93398ed3c76981e72dd1fd22557a78ce36c0515f679e27f0bb5bc5f';
    
    const address = hash.calculateContractAddressFromHash(
      publicKeyBigInt,
      OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0
    );
    
    const formattedAddress = encode.addHexPrefix(address.toString(16));
    console.log('📝 Calculated account address:', formattedAddress);
    
    return formattedKey;
  } catch (validationError) {
    console.error('❌ Key validation failed:', validationError);
    throw new Error('Generated key failed validation');
  }
}

// Main function
function main() {
  try {
    console.log("🔄 Starting Starknet private key derivation...");
    console.log(`Using signature: ${SIGNATURE}`);
    
    // Derive a private key from the signature
    const privateKey = deriveStarkKeyFromSignature(SIGNATURE);
    
    console.log("\n✅ RESULT:");
    console.log("====================");
    console.log(`Private Key: ${privateKey}`);
    console.log("====================");
    console.log("\nTo use this private key with the transfer script, set it as an environment variable:");
    console.log("export TEST_ACCOUNT_PRIVATE_KEY=\"" + privateKey + "\"");
  } catch (error) {
    console.error('❌ Error in key derivation:', error.message);
  }
}

// Run the main function
main(); 