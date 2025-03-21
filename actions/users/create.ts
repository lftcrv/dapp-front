'use server';

import { WalletAddressType } from '@/types/user';
import { validateApiConfig, validateApiResponse } from '../shared/validation';

interface CreateUserResponse {
  status: string;
  data: {
    user: {
      id: string;
      starknetAddress: string;
      evmAddress?: string;
      addressType: string;
      twitterHandle?: string;
      lastConnection: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

interface CreateUserParams {
  starknetAddress: string;
  evmAddress?: string;
  addressType: WalletAddressType;
  twitterHandle?: string;
  accessCode?: string;
}

/**
 * Creates a new user
 * 
 * @param params User data
 * @returns User creation result
 */
export async function createUser(params: CreateUserParams): Promise<{
  success: boolean;
  data?: CreateUserResponse['data']['user'];
  error?: string;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;

    // Validate API configuration
    validateApiConfig(apiUrl, apiKey);

    const response = await fetch(`${apiUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
      },
      body: JSON.stringify(params),
    });

    // Validate response
    validateApiResponse(response);

    // Parse response
    const result = await response.json() as CreateUserResponse;

    return {
      success: true,
      data: result.data.user,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}