'use server';

import { validateAccessCode } from '../access-codes/validate';
import { User } from '@/types/user';

/**
 * Validates a referral code via the backend.
 * Assumes the backend API sets the necessary cookie upon success.
 * 
 * @param code The referral code to validate
 * @param user The user object (optional, depends on backend validation logic)
 * @returns Result of the validation operation
 */
export async function validateReferralCode(code: string, user?: User): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // Use user.id if available, otherwise pass an identifier if required by backend
    // Adjust "anonymous" or remove userId entirely if your backend doesn't need it for initial validation
    const userIdForValidation = user?.id || 'anonymous'; 

    if (!code) {
      return {
        success: false,
        error: 'Missing referral code'
      };
    }

    // Validate the code via backend
    const validationResult = await validateAccessCode(code, userIdForValidation);
    console.log('validationResult', validationResult);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: validationResult.error || 'Invalid referral code'
      };
    }

    // Backend is assumed to set the cookie here

    return {
      success: true,
      message: 'Referral code validated successfully'
    };

  } catch (error) {
    console.error('Error validating referral code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}