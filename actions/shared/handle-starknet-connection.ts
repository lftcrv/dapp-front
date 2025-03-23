'use server';

import { connectUser, getUserByStarknetAddress, createUser } from '@/actions/users';
import { WalletAddressType } from '@/types/user';

/**
 * Handles Starknet wallet connection by either creating a new user or
 * updating the last connection time for an existing user
 * 
 * @param starknetAddress The Starknet wallet address
 * @returns The user data or null if the operation failed
 */
export async function handleStarknetConnection(starknetAddress: string) {
  if (!starknetAddress) {
    throw new Error('Starknet address is required');
  }

  try {
    // First check if user exists
    const existingUser = await getUserByStarknetAddress(starknetAddress);

    if (existingUser.success && existingUser.data) {
      // User exists, update last connection time
      const connectedUser = await connectUser(starknetAddress);
      return connectedUser.success ? connectedUser.data : null;
    } else {
      // User doesn't exist, create a new one
      const newUser = await createUser({
        starknetAddress,
        addressType: WalletAddressType.NATIVE,
      });
      
      return newUser.success ? newUser.data : null;
    }
  } catch (error) {
    // Log the error but don't throw, allow the UI to continue
    // The only exception is if it's a 409 conflict which means the user already exists
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('409')) {
      console.log('User already exists, ignoring 409 conflict error');
      return null;
    }
    
    console.error('Error handling Starknet connection:', error);
    throw error;
  }
}