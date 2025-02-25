'use server';

import { User } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_ELIZA_API_URL || 'http://localhost:8080';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is not set');
}

const headers: HeadersInit = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY
};

export async function getUsers(): Promise<{ success: boolean; data?: { users: User[] }; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/users`, {
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.message || 'Failed to fetch users' 
      };
    }

    return { 
      success: true, 
      data: data.data 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch users' 
    };
  }
}

export async function getUserById(id: string): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      return { 
        success: false, 
        error: data.message || 'Failed to fetch user' 
      };
    }

    return { 
      success: true, 
      data: data.data 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch user' 
    };
  }
}

export async function getUserByStarknetAddress(address: string): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/users/starknet/${address}`, {
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'No user found with this Starknet address'
        };
      }
      return { 
        success: false, 
        error: data.message || 'Failed to fetch user' 
      };
    }

    return { 
      success: true, 
      data: data.data 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch user by Starknet address' 
    };
  }
}

export async function getUserByEvmAddress(address: string): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/users/evm/${address}`, {
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'No user found with this EVM address'
        };
      }
      return { 
        success: false, 
        error: data.message || 'Failed to fetch user' 
      };
    }

    return { 
      success: true, 
      data: data.data 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch user by EVM address' 
    };
  }
} 