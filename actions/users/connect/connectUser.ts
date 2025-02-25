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

export async function connectUser(starknetAddress: string): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
  try {
    const endpoint = `${API_URL}/api/users/connect`;
    console.log('📊 API Configuration:', {
      url: endpoint,
      method: 'POST',
      hasApiKey: !!API_KEY,
      headers: {
        ...headers,
        'x-api-key': API_KEY ? '(set)' : '(missing)'
      }
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ starknetAddress })
    });

    console.log('📊 API Response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const data = await response.json();
    console.log('📥 Response data:', data);
    
    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 404) {
        return { 
          success: false, 
          error: 'No user found with this Starknet address' 
        };
      }
      return { 
        success: false, 
        error: data.message || 'Failed to connect user' 
      };
    }

    return { 
      success: true, 
      data: data.data 
    };
  } catch (error) {
    console.error('❌ Connect user error:', {
      error,
      starknetAddress,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to connect user' 
    };
  }
} 