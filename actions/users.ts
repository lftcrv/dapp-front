'use server'

import { User } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is not set');
}

interface CreateUserPayload {
  starknetAddress: string;
  evmAddress: string;
  addressType: 'derived' | 'starknet_native';
  twitterHandle?: string;
  accessCode?: string;
}

interface UpdateUserPayload {
  evmAddress?: string;
  twitterHandle?: string;
}

const headers: HeadersInit = {
  'Content-Type': 'application/json',
  'X-API-KEY': API_KEY
};

export async function createUser(payload: CreateUserPayload): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        error: data.message || 'Failed to create user' 
      };
    }

    return { 
      success: true, 
      data: data.data 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create user' 
    };
  }
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.message || 'Failed to update user' 
      };
    }

    return { 
      success: true, 
      data: data.data 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update user' 
    };
  }
}

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

export async function getUserByStarknetAddress(address: string): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/users/starknet/${address}`, {
      headers
    });

    const data = await response.json();

    if (!response.ok) {
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