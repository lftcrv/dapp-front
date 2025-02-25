import { type User } from '@/lib/types';
import { hash, ec, encode, Account, CallData, RpcProvider } from 'starknet';
import { handleEvmConnection } from './handle-starknet-connection';
import { fundAndDeployWallet } from './deploy-starknet-wallet';
import { 
  OZ_ACCOUNT_CLASS_HASH, 
  STARKNET_CURVE_ORDER,
  DEFAULT_NODE_URL
} from './starknet-constants';

// Constants for deployment
const NODE_URL = DEFAULT_NODE_URL;
const MAX_DEPLOYMENT_ATTEMPTS = 3; // Maximum number of deployment attempts
const DEPLOYMENT_ATTEMPT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// DEBUG LOGS: Enable detailed logging for deployment process
const DEBUG = {
  log: (...args: any[]) => console.log('[Starknet Derivation]:', ...args),
  error: (...args: any[]) => console.error('[Starknet Derivation Error]:', ...args),
  signature: (...args: any[]) => console.log('[Signature Storage]:', ...args)
}

interface WalletDeploymentResult {
  success: boolean;
  error?: string;
  data?: {
    address: string;
    deployTxHash?: string;
    account?: Account;
  };
}

// Simple helper to manage signatures in localStorage
export const signatureStorage = {
  getSignature: async (evmAddress: string): Promise<string | null> => {
    try {
      const signature = localStorage.getItem(
        `signature_${evmAddress.toLowerCase()}`,
      );
      return signature;
    } catch {
      return null;
    }
  },
  
  saveSignature: async (
    evmAddress: string,
    signature: string,
  ): Promise<boolean> => {
    try {
      localStorage.setItem(`signature_${evmAddress.toLowerCase()}`, signature);
      return true;
    } catch {
      return false;
    }
  },

  clearSignature: async (evmAddress: string): Promise<boolean> => {
    try {
      localStorage.removeItem(`signature_${evmAddress.toLowerCase()}`);
      return true;
    } catch {
      return false;
    }
  },
};

// Helper to manage derived Starknet addresses in localStorage
export const derivedAddressStorage = {
  getAddress: (evmAddress: string): string | null => {
    try {
      return localStorage.getItem(`derived_address_${evmAddress.toLowerCase()}`);
    } catch {
      return null;
    }
  },
  
  saveAddress: (evmAddress: string, starknetAddress: string): boolean => {
    try {
      localStorage.setItem(`derived_address_${evmAddress.toLowerCase()}`, starknetAddress);
      console.log('✅ Saved derived Starknet address to localStorage:', {
        evmAddress,
        starknetAddress,
        key: `derived_address_${evmAddress.toLowerCase()}`
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to save derived address:', error);
      return false;
    }
  },

  clearAddress: (evmAddress: string): boolean => {
    try {
      localStorage.removeItem(`derived_address_${evmAddress.toLowerCase()}`);
      return true;
    } catch {
      return false;
    }
  }
};

// Utility to clear all deployment data for an address
export const clearDeploymentData = (evmAddress: string): boolean => {
  try {
    if (!evmAddress) return false;

    const normalizedAddress = evmAddress.toLowerCase();
    const deploymentAttemptKey = `${normalizedAddress}_deployment_attempt`;
    const signatureKey = `signature_${normalizedAddress}`;

    // Clear both deployment attempt and signature
    localStorage.removeItem(deploymentAttemptKey);
    localStorage.removeItem(signatureKey);

    console.log('🧹 Cleared all deployment data for:', evmAddress);
    return true;
  } catch (error) {
    console.error('❌ Failed to clear deployment data:', error);
    return false;
  }
};

// Debug utility to get deployment status
interface DeploymentStatus {
  timestamp: number;
  failed: boolean;
  status?: string;
  error?: string;
  address?: string;
  userId?: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export const getDeploymentStatus = (
  evmAddress: string,
): DeploymentStatus | null => {
  try {
    if (!evmAddress) return null;

    const normalizedAddress = evmAddress.toLowerCase();
    const deploymentAttemptKey = `${normalizedAddress}_deployment_attempt`;
    const data = localStorage.getItem(deploymentAttemptKey);

    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to get deployment status:', error);
    return null;
  }
};

// Add this interface near the top of the file, after the imports
interface DeployAccountPayload {
  classHash: string;
  constructorCalldata: string[];
  addressSalt: bigint;
  maxFee: string;
}

// Function to derive Starknet private key from signature
// This matches the approach in test-starknet-deployment.js
export function deriveStarkKeyFromSignature(signature: string): string {
  DEBUG.log('🔍 Processing signature for key derivation:', {
    signatureLength: signature.length,
    signaturePreview: `${signature.slice(0, 10)}...${signature.slice(-10)}`,
  });

  // Remove '0x' prefix if present
  const cleanSignature = signature.startsWith('0x')
    ? signature.slice(2)
    : signature;
  DEBUG.log('✅ Cleaned signature:', {
    length: cleanSignature.length,
    preview: `${cleanSignature.slice(0, 10)}...${cleanSignature.slice(-10)}`,
  });

  // The Starknet curve order (n) is defined as a constant above

  // Generate a deterministic but valid private key
  // Use a simple approach: hash the signature with starknetKeccak and ensure it's within range
  const hashedSignature = hash.starknetKeccak(cleanSignature).toString(16);
  DEBUG.log('📊 Hashed signature:', {
    hash: hashedSignature,
    preview: `${hashedSignature.slice(0, 10)}...${hashedSignature.slice(-10)}`,
  });

  // Convert to BigInt and ensure it's within the valid range by taking modulo
  const privateKeyBigInt = BigInt(`0x${hashedSignature}`);
  const curveOrder = BigInt(STARKNET_CURVE_ORDER);

  // Ensure the key is less than the curve order but greater than 1
  // This is critical for Starknet key validity
  const validPrivateKey = (
    (privateKeyBigInt % (curveOrder - BigInt(2))) +
    BigInt(1)
  ).toString(16);

  // Ensure the key is properly formatted with 0x prefix
  const formattedKey = `0x${validPrivateKey}`;

  DEBUG.log('🔑 Derived private key:', {
    preview: `${formattedKey.slice(0, 10)}...${formattedKey.slice(-10)}`,
  });

  return formattedKey;
}

// This function is now simplified to use the deploy-starknet-wallet.ts implementation
export async function deployAccount(
  privateKey: string,
  provider: RpcProvider,
): Promise<WalletDeploymentResult> {
  try {
    DEBUG.log('🔄 Starting account deployment with provider');
    
    try {
      // Access provider details safely
      const providerDetails = provider as any;
      DEBUG.log(`🌐 Connected to node: ${providerDetails.nodeUrl || 'Unknown'}`);
    } catch (error) {
      DEBUG.log(`🌐 Connected to provider (nodeUrl not accessible)`);
    }
    
    DEBUG.log(`🔑 Using private key: ${privateKey.slice(0, 10)}...${privateKey.slice(-10)}`);
    
    // Calculate the public key and address first to check if already deployed
    const starkKeyPub = ec.starkCurve.getPublicKey(privateKey);
    const publicKeyHex = encode.buf2hex(starkKeyPub);
    DEBUG.log(`Raw public key: ${publicKeyHex}`);
    
    // Extract the x-coordinate
    const xCoordinate = publicKeyHex.startsWith('0x') 
      ? publicKeyHex.slice(4, 4 + 64) 
      : publicKeyHex.slice(2, 2 + 64);
    
    // Format the x-coordinate with 0x prefix
    const formattedPublicKey = `0x${xCoordinate}`;
    DEBUG.log(`Formatted public key (x-coordinate): ${formattedPublicKey}`);
    
    // Convert to BigInt
    let publicKeyBigInt = BigInt(formattedPublicKey);
    DEBUG.log(`Public key as BigInt: ${publicKeyBigInt.toString()}`);
    
    // Check if the public key is too large
    const curveOrder = BigInt(STARKNET_CURVE_ORDER);
    if (publicKeyBigInt >= curveOrder) {
      DEBUG.log('⚠️ Public key is too large, applying modulo with curve order');
      publicKeyBigInt = publicKeyBigInt % curveOrder;
      DEBUG.log(`Adjusted public key: ${publicKeyBigInt.toString()}`);
    }

    // Create constructor calldata with the public key
    const constructorCalldata = CallData.compile({
      publicKey: publicKeyBigInt.toString()
    });
    
    // Calculate the contract address
    const address = hash.calculateContractAddressFromHash(
      publicKeyBigInt,
      OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0
    );
    
    // Format the address with 0x prefix
    const formattedAddress = `0x${BigInt(address).toString(16)}`;
    DEBUG.log('📝 Calculated account address:', formattedAddress);
    
    // Check if the account is already deployed
    try {
      const accountClassHash = await provider.getClassHashAt(formattedAddress);
      DEBUG.log(`✅ Account already deployed with class hash: ${accountClassHash}`);
      DEBUG.log('- No need to deploy again');
      DEBUG.log(`- Class Hash: ${OZ_ACCOUNT_CLASS_HASH}`);
      DEBUG.log(`- Constructor Calldata: ${JSON.stringify(constructorCalldata)}`);
      DEBUG.log(`- Address Salt: ${publicKeyBigInt.toString()}`);
      
      // Create an account instance with the deployed address
      const account = new Account(
        provider,
        formattedAddress,
        privateKey
      );
      
      return {
        success: true,
        data: {
          address: formattedAddress,
          account,
        },
      };
    } catch {
      DEBUG.log(`📊 Account not deployed yet at address: ${formattedAddress}`);
    }
    
    // Use the fundAndDeployWallet function from deploy-starknet-wallet.ts
    DEBUG.log('🔄 Proceeding with funding and deployment...');
    const result = await fundAndDeployWallet(privateKey);
    
    if (!result.success) {
      DEBUG.error(`❌ Deployment failed: ${result.error}`);
      return {
        success: false,
        error: result.error || 'Unknown deployment error',
        data: {
          address: result.address || '',
        },
      };
    }
    
    DEBUG.log(`✅ Deployment successful!`);
    DEBUG.log(`- Address: ${result.address}`);
    DEBUG.log(`- Transaction hash: ${result.txHash || 'N/A'}`);
    
    // Create an account instance with the deployed address
    const account = new Account(
      provider,
      result.address || '',
      privateKey
    );
    
    return {
      success: true,
      data: {
        address: result.address || '',
        deployTxHash: result.txHash,
        account,
      },
    };
  } catch (error) {
    DEBUG.error('❌ Error in deployAccount:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deriveStarknetAccount(
  evmAddress: string,
  signMessage: (message: string) => Promise<string>,
): Promise<User | null> {
  try {
    DEBUG.log('🔄 Starting Starknet account derivation for EVM address:', evmAddress);
    
    // Check if we already have a signature for this address
    const existingSignature = await signatureStorage.getSignature(evmAddress);
    
    let signature: string;
    
    if (existingSignature) {
      DEBUG.log('✅ Found existing signature for address:', evmAddress);
      signature = existingSignature;
    } else {
      DEBUG.log('🔏 No existing signature found, requesting new signature');
      
      // Request a signature from the user
      const message = `Sign this message to derive your Starknet account.\n\nThis signature will be used to deterministically generate your Starknet private key.\n\nAddress: ${evmAddress}\nTimestamp: ${Date.now()}`;
      
      try {
        signature = await signMessage(message);
        DEBUG.log('✅ Got new signature from wallet:', {
          length: signature.length,
          preview: `${signature.slice(0, 10)}...${signature.slice(-10)}`,
        });
        
        // Save the signature for future use
        await signatureStorage.saveSignature(evmAddress, signature);
      } catch (error) {
        DEBUG.error('❌ Failed to get signature:', error);
        throw new Error('User rejected signature request');
      }
    }
    
    // Derive Starknet private key from signature
    const privateKey = deriveStarkKeyFromSignature(signature);
    
    // Initialize provider with custom node URL
    const provider = new RpcProvider({
      nodeUrl: NODE_URL,
    });
    
    // Get the precomputed address without deploying
    const precomputedAddress = await getPrecomputedAddress(privateKey);
    if (!precomputedAddress) {
      throw new Error('Failed to compute Starknet address');
    }
    
    // Save the derived Starknet address to localStorage
    derivedAddressStorage.saveAddress(evmAddress, precomputedAddress);
    
    // Create the user with the pre-computed address
    const userResult = await handleEvmConnection(
      evmAddress,
      signature,
      precomputedAddress,
    );
    
    if (!userResult.success) {
      DEBUG.error('❌ Failed to handle EVM connection:', userResult.error);
      return null;
    }
    
    // Now attempt the actual deployment
    const deployResult = await deployAccount(privateKey, provider);
    
    if (!deployResult.success) {
      DEBUG.error('❌ Deployment failed but user was created:', deployResult.error);
      // Return the user even if deployment failed
      return userResult.data?.user || null;
    }
    
    DEBUG.log('✅ Account deployed successfully:', deployResult.data?.address);
    return userResult.data?.user || null;
  } catch (error) {
    DEBUG.error('❌ Error in deriveStarknetAccount:', error);
    return null;
  }
}

// Helper function to get the precomputed address without deploying
async function getPrecomputedAddress(
  privateKey: string,
): Promise<string | null> {
  try {
    // Ensure privateKey is properly formatted
    const formattedPrivateKey = privateKey.startsWith('0x')
      ? privateKey
      : `0x${privateKey}`;

    // Calculate public key from private key
    const starkKeyPub = ec.starkCurve.getPublicKey(formattedPrivateKey);
    const pubKeyHex = encode.buf2hex(starkKeyPub);
    
    // Extract the x-coordinate (remove the '04' prefix and take the first half)
    const xCoordinate = pubKeyHex.startsWith('0x') 
      ? pubKeyHex.slice(4, 4 + 64) 
      : pubKeyHex.slice(2, 2 + 64);
    
    // Format the x-coordinate with 0x prefix
    const formattedPublicKey = `0x${xCoordinate}`;
    
    // Convert to BigInt
    let pubKeyBigInt = BigInt(formattedPublicKey);
    
    // The Starknet curve order
    const curveOrder = BigInt(STARKNET_CURVE_ORDER);

    // If the public key is too large, take the modulo with the curve order
    if (pubKeyBigInt >= curveOrder) {
      pubKeyBigInt = pubKeyBigInt % curveOrder;
    }

    // Calculate future address of the account
    const constructorCalldata = CallData.compile({
      publicKey: pubKeyBigInt.toString(),
    });

    const address = hash.calculateContractAddressFromHash(
      pubKeyBigInt,
      OZ_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0,
    );

    return `0x${BigInt(address).toString(16)}`;
  } catch (error) {
    return null;
  }
}

/**
 * Debug function to help diagnose deployment issues
 */
export function debugDeployment(evmAddress: string) {
  if (!evmAddress) {
    console.error('❌ No EVM address provided for debugging');
    return;
  }

  try {
    // Normalize the address
    const normalizedAddress = evmAddress.toLowerCase();

    // Check for deployment attempts - use the same key format as in the rest of the code
    const deploymentAttemptKey = `${normalizedAddress}_deployment_attempt`;
    const deploymentData = localStorage.getItem(deploymentAttemptKey);

    // Check for signature
    const signatureKey = `signature_${normalizedAddress}`;
    const signature = localStorage.getItem(signatureKey);

    console.log('📊 Deployment debug for address:', evmAddress);
    console.log(
      '- Deployment data:',
      deploymentData ? JSON.parse(deploymentData) : 'None',
    );
    console.log('- Signature present:', !!signature);

    if (signature) {
      console.log(
        '- Signature preview:',
        `${signature.slice(0, 10)}...${signature.slice(-10)}`,
      );

      // Try to derive a key from the signature to check if it's valid
      try {
        const privateKey = deriveStarkKeyFromSignature(signature);
        console.log('- Test key derivation:', {
          success: true,
          privateKeyPreview: `${privateKey.slice(0, 10)}...${privateKey.slice(
            -10,
          )}`,
        });

        // Try to derive a public key
        try {
          const publicKey = ec.starkCurve.getPublicKey(privateKey);
          const pubKeyHex = encode.buf2hex(publicKey);
          console.log('- Public key derivation:', {
            success: true,
            publicKeyPreview:
              pubKeyHex.slice(0, 10) + '...' + pubKeyHex.slice(-10),
          });
        } catch (pubKeyError) {
          console.log('- Public key derivation:', {
            success: false,
            error: pubKeyError,
          });
        }
      } catch (keyError) {
        console.log('- Test key derivation:', {
          success: false,
          error: keyError,
        });
      }
    }

    return {
      address: evmAddress,
      hasDeploymentData: !!deploymentData,
      deploymentData: deploymentData ? JSON.parse(deploymentData) : null,
      hasSignature: !!signature,
      signaturePreview: signature
        ? `${signature.slice(0, 10)}...${signature.slice(-10)}`
        : null,
    };
  } catch (error) {
    console.error('❌ Error in debugDeployment:', error);
    return {
      address: evmAddress,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Add global debug utilities
export function setupGlobalDebugUtils() {
  // Clear deployment data for a specific address
  window.clearStarknetDeploymentData = clearDeploymentData;

  // Debug deployment for a specific address
  window.debugStarknetDeployment = (address: string) => {
    if (!address) {
      console.error('❌ Please provide an EVM address to debug');
      return;
    }

    const normalizedAddress = address.toLowerCase();
    const deploymentAttemptKey = `starknet-deployment-attempt-${normalizedAddress}`;
    const deploymentData = localStorage.getItem(deploymentAttemptKey);

    if (!deploymentData) {
      console.log('ℹ️ No deployment data found for address:', address);
      return;
    }

    try {
      const parsedData = JSON.parse(deploymentData);
      console.log('📊 Deployment data for address:', address);
      console.log('Timestamp:', new Date(parsedData.timestamp).toISOString());
      console.log(
        'Status:',
        parsedData.status || (parsedData.failed ? 'failed' : 'unknown'),
      );
      console.log('Failed:', parsedData.failed || false);
      console.log('Attempt count:', parsedData.attemptCount || 1);
      console.log('Starknet address:', parsedData.address || 'Not available');
      console.log('User ID:', parsedData.userId || 'Not available');

      if (parsedData.error) {
        console.error('Error:', parsedData.error);
      }

      if (parsedData.details) {
        console.log('Details:', parsedData.details);
      }

      return parsedData;
    } catch (error) {
      console.error('❌ Error parsing deployment data:', error);
      console.log('Raw data:', deploymentData);
    }
  };

  // List all Starknet deployment attempts
  window.listStarknetDeployments = () => {
    const deployments: Record<string, unknown> = {};

    // Scan localStorage for deployment attempts
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('starknet-deployment-attempt-')) {
        try {
          const address = key.replace('starknet-deployment-attempt-', '');
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          deployments[address] = {
            timestamp: data.timestamp
              ? new Date(data.timestamp).toISOString()
              : 'unknown',
            status: data.status || (data.failed ? 'failed' : 'unknown'),
            failed: data.failed || false,
            attemptCount: data.attemptCount || 1,
            starknetAddress: data.address || 'Not available',
            userId: data.userId || 'Not available',
          };
        } catch (error) {
          console.error(
            '❌ Error parsing deployment data for key:',
            key,
            error,
          );
        }
      }
    }

    console.log('📋 All Starknet deployment attempts:', deployments);
    return deployments;
  };
}

// Helper function to fetch a user by ID
async function fetchUser(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return null;
  }
}
