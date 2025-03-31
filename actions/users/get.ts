'use server';

import { User } from '@/types/user';
import { validateApiConfig, validateApiResponse } from '../shared/validation';

interface UserResponse {
  status: string;
  data: {
    user: User;
  };
}

/**
 * Retrieves a user by ID
 * 
 * @param userId User ID
 * @returns User data or error
 */
export async function getUserById(userId: string): Promise<{
  success: boolean;
  data?: UserResponse['data']['user'];
  error?: string;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;

    // Validate API configuration
    validateApiConfig(apiUrl, apiKey);

    const response = await fetch(`${apiUrl}/api/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
      },
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
    const result = await response.json() as UserResponse;

    return {
      success: true,
      data: result.data.user,
    };
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Retrieves a user by Starknet address
 * 
 * @param address Starknet address
 * @returns User data or error
 */
export async function getUserByStarknetAddress(address: string): Promise<{
  success: boolean;
  data?: UserResponse['data']['user'];
  error?: string;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;

    // Validate API configuration
    validateApiConfig(apiUrl, apiKey);

    const response = await fetch(`${apiUrl}/api/users/starknet/${address}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
      },
    });

    // If user not found
    if (response.status === 404) {
      return {
        success: false,
        error: `User with Starknet address ${address} not found`,
      };
    }

    // Validate response
    validateApiResponse(response);

    // Parse response
    const result = await response.json() as UserResponse;

    return {
      success: true,
      data: result.data.user,
    };
  } catch (error) {
    console.error(`Error fetching user with Starknet address ${address}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Retrieves a user by EVM address
 * 
 * @param address EVM address
 * @returns User data or error
 */
export async function getUserByEvmAddress(address: string): Promise<{
  success: boolean;
  data?: UserResponse['data']['user'];
  error?: string;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;

    // Validate API configuration
    validateApiConfig(apiUrl, apiKey);

    const response = await fetch(`${apiUrl}/api/users/evm/${address}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
      },
    });

    // If user not found
    if (response.status === 404) {
      return {
        success: false,
        error: `User with EVM address ${address} not found`,
      };
    }

    // Validate response
    validateApiResponse(response);

    // Parse response
    const result = await response.json() as UserResponse;

    return {
      success: true,
      data: result.data.user,
    };
  } catch (error) {
    console.error(`Error fetching user with EVM address ${address}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * Retrieves all users
 * 
 * @returns List of users or error
 */
export async function getAllUsers(): Promise<{
  success: boolean;
  data?: UserResponse['data']['user'][];
  error?: string;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiKey = process.env.API_KEY;

    // Validate API configuration
    validateApiConfig(apiUrl, apiKey);

    const response = await fetch(`${apiUrl}/api/users`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
      },
    });

    // Validate response
    validateApiResponse(response);

    // Parse response
    const result = await response.json();

    return {
      success: true,
      data: result.data.users,
    };
  } catch (error) {
    console.error('Error fetching all users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}