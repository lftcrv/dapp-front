'use server';

import { validateAccessCode } from '../access-codes/validate';
import { User } from '@/types/user';

/**
 * Validates a referral code and registers/updates a user with it
 * 
 * @param code The referral code to validate
 * @param userId The id of the user
 * @returns Result of the operation
 */
export async function validateReferralCode(code: string, user: User): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    if (!code || !user.id) {
      return {
        success: false,
        error: 'Missing referral code or wallet address'
      };
    }

    // 1. Validate the code
    const validationResult = await validateAccessCode(code, user.id);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: validationResult.error || 'Invalid referral code'
      };
    }

    return {
      success: true,
      message: 'User created successfully with referral code'
    };

  } catch (error) {
    console.error('Error validating referral code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}