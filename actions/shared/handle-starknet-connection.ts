'use server';

import { getUserByStarknetAddress, createUser } from '@/actions/users';
import { WalletAddressType } from '@/types/user';
import { connectUser } from '@/actions/users/connect';
import { validateAccessCode } from '@/actions/access-codes/validate';
import { updateUser } from '@/actions/users/update';

/**
 * Handles the Starknet wallet connection process
 * - Checks if user exists
 * - Creates new user if needed
 * - Validates and applies referral code if provided
 * - Updates the user's last connection time
 * 
 * @param starknetAddress The starknet wallet address
 * @param referralCode Optional referral code
 * @returns Information about the operation result
 */
export async function handleStarknetConnection(
  starknetAddress: string,
  referralCode?: string
): Promise<{
  success: boolean;
  newUser: boolean;
  referralApplied: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    // Step 1: Check if user already exists
    const existingUser = await getUserByStarknetAddress(starknetAddress);
    
    if (existingUser.success && existingUser.data) {
      // User exists - update last connection time
      const updateResult = await connectUser(starknetAddress);
      
      // Check if they already have a referral code
      const hasReferral = !!existingUser.data.usedReferralCode;
      
      return {
        success: true,
        newUser: false,
        referralApplied: hasReferral,
        userId: existingUser.data.id
      };
    }
    
    // Step 2: Handle referral code validation for new users
    let referralIsValid = false;
    
    if (referralCode) {
      const validationResult = await validateAccessCode(referralCode, starknetAddress);
      referralIsValid = validationResult.isValid || false;
    }
    
    // Step 3: Create new user
    // Always create the user, even if referral is invalid - the UI will remain blurred
    // until a valid referral is provided
    const newUser = await createUser({
      starknetAddress,
      addressType: WalletAddressType.NATIVE,
      // If referral is valid, include it in user creation
      ...(referralIsValid ? { accessCode: referralCode } : {})
    });
    
    if (!newUser.success || !newUser.data) {
      return {
        success: false,
        newUser: false,
        referralApplied: false,
        error: newUser.error || 'Failed to create user'
      };
    }
    
    // Step 4: If referral code is valid but wasn't included in user creation,
    // apply it separately by updating the user
    if (referralCode && referralIsValid && !newUser.data.usedReferralCode) {
      await updateUser(newUser.data.id, { accessCode: referralCode });
    }
    
    return {
      success: true,
      newUser: true,
      referralApplied: referralIsValid,
      userId: newUser.data.id
    };
  } catch (error) {
    console.error('Error handling Starknet connection:', error);
    return {
      success: false,
      newUser: false,
      referralApplied: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}