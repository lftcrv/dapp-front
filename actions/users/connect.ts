'use server';

import { validateApiConfig, validateApiResponse } from '../shared/validation';

interface ConnectUserResponse {
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

/**
 * Updates user's last connection time when they connect
 * 
 * @param starknetAddress The starknet address of the user
 * @returns Updated user data or error
 */
export async function connectUser(starknetAddress: string): Promise<{
  success: boolean;
  data?: ConnectUserResponse['data']['user'];
  error?: string;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;

    // Validate API configuration
    validateApiConfig(apiUrl, apiKey);

    const response = await fetch(`${apiUrl}/api/users/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
      },
      body: JSON.stringify({ starknetAddress }),
    });

    // If user not found
    if (response.status === 404) {
      return {
        success: false,
        error: 'No user found with this Starknet address',
      };
    }

    // Validate response
    validateApiResponse(response);

    // Parse response
    const result = await response.json() as ConnectUserResponse;

    return {
      success: true,
      data: result.data.user,
    };
  } catch (error) {
    console.error('Error connecting user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}