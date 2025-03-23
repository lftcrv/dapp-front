'use server';

import { createUser, getUserByEvmAddress } from '@/actions/users';
import { WalletAddressType } from '@/types/user';

// Simple in-memory storage for signatures
export const signatureStorage = {
  // Store signature for each EVM address
  signatures: new Map<string, { signature: string; timestamp: number }>(),

  // Get signature if it exists and is not expired (1 hour)
  getSignature: (evmAddress: string): string | null => {
    const entry = signatureStorage.signatures.get(evmAddress.toLowerCase());
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > 60 * 60 * 1000; // 1 hour
    return isExpired ? null : entry.signature;
  },

  // Store a new signature
  setSignature: (evmAddress: string, signature: string) => {
    signatureStorage.signatures.set(evmAddress.toLowerCase(), {
      signature,
      timestamp: Date.now(),
    });
  },

  // Clear signature
  clearSignature: (evmAddress: string) => {
    signatureStorage.signatures.delete(evmAddress.toLowerCase());
  },
};

/**
 * Derives a Starknet account from an EVM address using a signature
 * 
 * @param evmAddress The EVM wallet address
 * @param signFn Function to sign messages with the EVM wallet
 * @returns The derived account information or null if derivation failed
 */
export async function deriveStarknetAccount(
  evmAddress: string,
  signFn: (message: string) => Promise<string>
) {
  if (!evmAddress) {
    throw new Error('EVM address is required');
  }

  try {
    // Check if user already exists with this EVM address
    const existingUser = await getUserByEvmAddress(evmAddress);

    if (existingUser.success && existingUser.data) {
      // User already exists with a derived account
      return {
        starknetAddress: existingUser.data.starknetAddress,
        evmAddress: existingUser.data.evmAddress,
      };
    }

    // Get the signature for this address or create a new one
    let signature = signatureStorage.getSignature(evmAddress);
    
    if (!signature) {
      // Define a deterministic message for deriving the account
      const message = `Sign this message to derive your Starknet account from your EVM address: ${evmAddress}`;
      
      // Get the signature from the wallet
      signature = await signFn(message);
      
      // Store the signature for future use
      signatureStorage.setSignature(evmAddress, signature);
    }

    // Use the signature to derive a deterministic Starknet address
    // This is a simplified example; in practice, you would use a more complex derivation
    const derivedAddress = await deriveAddressFromSignature(signature);
    
    // Create the user with the derived address
    const newUser = await createUser({
      starknetAddress: derivedAddress,
      evmAddress,
      addressType: WalletAddressType.DERIVED,
    });

    if (newUser.success && newUser.data) {
      return {
        starknetAddress: newUser.data.starknetAddress,
        evmAddress: newUser.data.evmAddress,
      };
    }

    throw new Error('Failed to create user with derived account');
  } catch (error) {
    // Check for 409 conflict which means the user already exists
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('409')) {
      console.log('User already exists, fetching existing user data');
      
      // Get the existing user by EVM address
      const existingUser = await getUserByEvmAddress(evmAddress);
      
      if (existingUser.success && existingUser.data) {
        return {
          starknetAddress: existingUser.data.starknetAddress,
          evmAddress: existingUser.data.evmAddress,
        };
      }
    }
    
    console.error('Error deriving Starknet account:', error);
    throw error;
  }
}

/**
 * Derive a Starknet address from a signature
 * This is a simplified example; in a real implementation you would use a more secure derivation method
 */
async function deriveAddressFromSignature(signature: string): Promise<string> {
  // This is a placeholder implementation
  // In a real application, you would use a cryptographic algorithm to derive the address
  
  // Remove the '0x' prefix if present
  const sigWithoutPrefix = signature.startsWith('0x') ? signature.slice(2) : signature;
  
  // Use the first 40 characters of the signature as the address
  // In a real implementation, you would use a more secure derivation method
  const addressPart = sigWithoutPrefix.slice(0, 40);
  
  // Return the address with '0x' prefix
  return `0x${addressPart}`;
}

/**
 * Legacy function to keep compatibility with existing code
 * This function is used directly in StarknetAccountDerivation component
 * 
 * @param evmAddress The EVM wallet address
 * @param signFn Function to sign messages with the EVM wallet
 * @returns The derived account information or null if derivation failed
 */
export async function deriveAccount(
  evmAddress: string,
  signFn: (message: string) => Promise<string>
) {
  return deriveStarknetAccount(evmAddress, signFn);
}