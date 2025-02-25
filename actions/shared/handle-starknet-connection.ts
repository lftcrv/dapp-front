'use server';

import { type User } from '@/lib/types';
import { getUserByEvmAddress, getUserByStarknetAddress } from '@/actions/users/query/getUsers';
import { createUser } from '@/actions/users/create/createUser';
import { connectUser } from '@/actions/users/connect/connectUser';
import { signatureStorage } from './derive-starknet-account';

const API_KEY = process.env.API_KEY;
const API_URL = process.env.NEXT_PUBLIC_ELIZA_API_URL;

if (!API_KEY) {
  console.error('❌ API_KEY is not configured');
}

if (!API_URL) {
  console.error('❌ API_URL is not configured');
}

console.log('📊 API Configuration:', {
  hasApiKey: !!API_KEY,
  apiUrl: API_URL || 'Not configured',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY ? '(set)' : '(missing)'
  }
});

export type ServerActionResult<T = undefined> = {
  success: boolean;
  error?: string;
  data?: T;
};

export async function handleStarknetConnection(
  starknetAddress: string,
  isNative: boolean = false
): Promise<ServerActionResult<{ user: User } | undefined>> {
  try {
    console.log('🔄 Starting Starknet connection process...', {
      starknetAddress,
      isNative
    });

    // Check if user exists by Starknet address
    console.log('🔍 Checking if user exists...');
    const existingUser = await getUserByStarknetAddress(starknetAddress);
    console.log('📊 Existing user check result:', existingUser);
    
    if (existingUser.success && existingUser.data?.user) {
      // User exists, update connection time
      console.log('✅ Found existing user:', existingUser.data.user);
      console.log('🔄 Updating connection time...');
      const result = await connectUser(starknetAddress);
      return {
        success: result.success,
        error: result.error,
        data: { user: existingUser.data.user }
      };
    }

    // Create new user
    console.log('🔄 Creating new user...');
    const result = await createUser({
      starknetAddress,
      // For native Starknet connections, we use a zero address as EVM address
      evmAddress: '0x0000000000000000000000000000000000000000',
      addressType: isNative ? 'NATIVE' : 'DERIVED',
    });
    console.log('📊 Create user result:', result);

    if (!result.success || !result.data?.user) {
      console.error('❌ Failed to create user:', result.error);
      return {
        success: false,
        error: result.error || 'Failed to create user'
      };
    }

    console.log('✅ User created successfully:', result.data.user);
    return {
      success: true,
      error: result.error,
      data: result.data
    };
  } catch (error) {
    console.error('❌ Error in handleStarknetConnection:', {
      error,
      starknetAddress,
      isNative,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function handleEvmConnection(
  evmAddress: string,
  signature: string,
  derivedStarknetAddress?: string
): Promise<ServerActionResult<{ user: User }>> {
  try {
    console.log('🔄 Starting handleEvmConnection with:', { 
      evmAddress, 
      signatureLength: signature.length,
      hasDeployedAddress: !!derivedStarknetAddress,
      deployedAddressPreview: derivedStarknetAddress ? `${derivedStarknetAddress.slice(0, 10)}...${derivedStarknetAddress.slice(-10)}` : 'none'
    });

    // Check if user exists with this EVM address
    console.log('🔍 Checking if user exists...');
    const existingUser = await getUserByEvmAddress(evmAddress);
    console.log('📊 Existing user check result:', existingUser);
    
    // Save signature
    console.log('💾 Saving signature...');
    await signatureStorage.saveSignature(evmAddress, signature);

    if (existingUser.success && existingUser.data?.user) {
      // User exists, check if they have a Starknet address
      const user = existingUser.data.user;
      console.log('✅ Found existing user:', user);
      
      if (user.starknetAddress) {
        // Update connection time
        console.log('🔄 Updating connection time...');
        const result = await connectUser(user.starknetAddress);
        return {
          success: result.success,
          error: result.error,
          data: { user },
        };
      } else if (derivedStarknetAddress) {
        // User exists but doesn't have a Starknet address, update with the derived one
        console.log('🔄 Updating existing user with new Starknet address:', derivedStarknetAddress);
        // For now, we'll create a new user since we don't have an update function
        const newUser = await createUser({
          starknetAddress: derivedStarknetAddress,
          evmAddress,
          addressType: 'DERIVED',
        });
        
        if (!newUser.success || !newUser.data?.user) {
          throw new Error(newUser.error || 'Failed to update user with Starknet address');
        }
        
        // Update connection time
        await connectUser(derivedStarknetAddress);
        return {
          success: true,
          data: { user: newUser.data.user },
        };
      }
    }

    // Either user doesn't exist or doesn't have Starknet address
    if (!derivedStarknetAddress) {
      // Instead of falling back to a random address, throw an error
      console.error('❌ No Starknet address provided and wallet deployment failed');
      return {
        success: false,
        error: 'Failed to deploy Starknet wallet. No address provided.'
      };
    }

    // Use the actual deployed wallet address
    console.log('✅ Using provided Starknet address:', derivedStarknetAddress);
    const starknetAddress = derivedStarknetAddress;

    // Create or update user
    console.log('🔄 Creating new user...');
    const newUser = await createUser({
      starknetAddress,
      evmAddress,
      addressType: 'DERIVED',
    });
    console.log('📊 Create user result:', newUser);

    if (!newUser.success || !newUser.data?.user) {
      throw new Error(newUser.error || 'Failed to create user');
    }

    // Update connection time
    console.log('🔄 Updating connection time for new user...');
    await connectUser(starknetAddress);
    return {
      success: true,
      data: { user: newUser.data.user },
    };

  } catch (error) {
    console.error('❌ Error in handleEvmConnection:', {
      error,
      evmAddress,
      signatureLength: signature.length,
      derivedStarknetAddress
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
