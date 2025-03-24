'use server';

import { User } from '@privy-io/react-auth';
import { validateApiConfig, validateApiResponse } from '../shared/validation';

interface UpdateUserResponse {
  status: string;
  data: {
    user: User;
  };
}

interface UpdateUserParams {
  evmAddress?: string;
  twitterHandle?: string;
  accessCode?: string;
}

/**
 * Updates user information
 * 
 * @param userId ID of the user to update
 * @param params Data to update
 * @returns Updated user data or error
 */
export async function updateUser(userId: string, params: UpdateUserParams): Promise<{
  success: boolean;
  data?: UpdateUserResponse['data']['user'];
  error?: string;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;

    // Validate API configuration
    validateApiConfig(apiUrl, apiKey);

    const response = await fetch(`${apiUrl}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
      },
      body: JSON.stringify(params),
    });

    // If user not found
    if (response.status === 404) {
      return {
        success: false,
        error: `User with ID ${userId} not found`,
      };
    }

    // Validate response
    validateApiResponse(response);

    // Parse response
    const result = await response.json() as UpdateUserResponse;

    return {
      success: true,
      data: result.data.user,
    };
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}