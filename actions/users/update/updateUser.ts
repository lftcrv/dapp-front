'use server';

import { User, UpdateUserPayload } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_ELIZA_API_URL || 'http://localhost:8080';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is not set');
}

const headers: HeadersInit = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY
};

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
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