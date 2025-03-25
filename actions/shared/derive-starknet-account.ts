'use server';

import { getUserByEvmAddress, createUser } from '@/actions/users';
import { WalletAddressType } from '@/types/user';
import { validateAccessCode } from '@/actions/access-codes/validate';
import { updateUser } from '@/actions/users/update';

/**
 * The message to be signed by the EVM wallet for Starknet derivation
 */
const SIGNATURE_MESSAGE = 
  'Sign this message to derive your Starknet account from your EVM address. ' +
  'This signature will not trigger any blockchain transaction or cost any gas fees.';

// In-memory storage for signatures (note: this will be cleared on server restarts)
// Since we can't export this directly, we keep it as a module-level variable
const signatures = new Map<string, { signature: string; timestamp: number }>();

/**
 * Gets a stored signature for an address if it exists and is not expired
 */
export async function getSignature(evmAddress: string): Promise<string | null> {
  const normalizedAddress = evmAddress.toLowerCase();
  const entry = signatures.get(normalizedAddress);
  
  if (!entry) return null;

  // Check if signature is expired (1 hour)
  const isExpired = Date.now() - entry.timestamp > 60 * 60 * 1000;
  return isExpired ? null : entry.signature;
}

/**
 * Saves a signature for an address
 */
export async function saveSignature(evmAddress: string, signature: string): Promise<void> {
  const normalizedAddress = evmAddress.toLowerCase();
  signatures.set(normalizedAddress, {
    signature,
    timestamp: Date.now(),
  });
}

/**
 * Clears a stored signature for an address
 */
export async function clearSignature(evmAddress: string): Promise<void> {
  const normalizedAddress = evmAddress.toLowerCase();
  signatures.delete(normalizedAddress);
}

/**
 * Derives a Starknet account from an EVM address
 * - Handles account creation in backend
 * - Processes referral code if provided
 * 
 * @param evmAddress The EVM wallet address
 * @param signer Function to sign messages with the EVM wallet
 * @param referralCode Optional referral code
 * @returns The derived account information or null if derivation fails
 */
export async function deriveAccount(
  evmAddress: string,
  signer: (message: string) => Promise<string>,
  referralCode?: string
): Promise<{
  starknetAddress: string;
  evmAddress: string;
  newUser: boolean;
  referralApplied: boolean;
} | null> {
  try {
    // Step 1: Check if user already exists in our system by EVM address
    const existingUserResult = await getUserByEvmAddress(evmAddress);
    
    // If user exists and already has a derived Starknet address, return it
    if (existingUserResult.success && existingUserResult.data?.starknetAddress) {
      const hasReferral = !!existingUserResult.data.usedReferralCode;
      return {
        starknetAddress: existingUserResult.data.starknetAddress,
        evmAddress,
        newUser: false,
        referralApplied: hasReferral
      };
    }

    // Step 2: Get cached signature or request a new one
    let signature = await getSignature(evmAddress);
    
    if (!signature) {
      // Request user to sign the message
      signature = await signer(SIGNATURE_MESSAGE);
      
      // Cache the signature for future use
      await saveSignature(evmAddress, signature);
    }
    
    // Step 3: Handle referral code validation
    let referralIsValid = false;
    
    if (referralCode) {
      const validationResult = await validateAccessCode(referralCode, evmAddress);
      referralIsValid = validationResult.isValid || false;
    }
    
    // Step 4: Use the EVM signature to derive a Starknet address
    // This is a placeholder for the actual derivation logic
    // In a real implementation, this would use cryptographic functions
    // to derive a deterministic Starknet address from the EVM signature
    const derivedStarknetAddress = `0x${Buffer.from(signature.slice(2), 'hex')
      .subarray(0, 31)
      .toString('hex')
      .padStart(64, '0')}`;
    
    // Step 5: Create a new user or update existing one
    const userParams = {
      evmAddress,
      starknetAddress: derivedStarknetAddress,
      addressType: WalletAddressType.DERIVED,
      ...(referralIsValid ? { usedReferralCode: referralCode } : {})
    };
    
    // If user exists but doesn't have a Starknet address, update the user
    // Otherwise create a new user
    const userResult = await createUser(userParams);
    
    if (!userResult.success || !userResult.data) {
      console.error('Failed to create or update user:', userResult.error);
      return null;
    }
    
    // Step 6: If referral code is valid but wasn't included in user creation,
    // apply it separately by updating the user
    if (referralCode && referralIsValid && !userResult.data.usedReferralCode) {
      await updateUser(userResult.data.id, { accessCode: referralCode });
    }
    
    return {
      starknetAddress: derivedStarknetAddress,
      evmAddress,
      newUser: !existingUserResult.success || !existingUserResult.data,
      referralApplied: referralIsValid
    };
  } catch (error) {
    console.error('Error deriving Starknet account:', error);
    return null;
  }
}