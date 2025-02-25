'use server';

import { User, CreateUserPayload, ValidationError } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_ELIZA_API_URL || 'http://localhost:8080';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is not set');
}

const headers: HeadersInit = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY
};

export async function createUser(payload: CreateUserPayload): Promise<{ success: boolean; data?: { user: User }; error?: string }> {
  try {
    // Format payload to match API expectations
    const formattedPayload = {
      starknetAddress: payload.starknetAddress,
      evmAddress: payload.evmAddress,
      addressType: payload.addressType.toUpperCase(),  // API expects DERIVED or NATIVE
      ...(payload.twitterHandle && { twitterHandle: payload.twitterHandle }),
      ...(payload.accessCode && { accessCode: payload.accessCode })
    };

    console.log('🔄 Creating user with payload:', formattedPayload);
    const requestBody = JSON.stringify(formattedPayload);
    console.log('📤 Request body:', requestBody);
    
    const endpoint = `${API_URL}/api/users`;
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
      body: requestBody
    });

    console.log('📊 API Response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const responseText = await response.text();
    console.log('📥 Raw response:', responseText);

    // Don't try to parse empty response
    if (!responseText.trim()) {
      throw new Error('Empty response from server');
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📥 Parsed response data:', data);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', {
        error: parseError,
        responseText
      });
      throw new Error('Invalid JSON response from server');
    }
    
    if (!response.ok) {
      console.error('❌ API Error:', {
        status: response.status,
        data
      });

      // Handle specific error cases as per API spec
      if (response.status === 400) {
        if (data.details) {
          const errors = (data.details as ValidationError[]).map(d => d.error);
          return {
            success: false,
            error: `Validation error: ${errors.join(', ')}`
          };
        }
        return { 
          success: false, 
          error: data.message || 'Invalid user data provided'
        };
      }

      return { 
        success: false, 
        error: data.message || 'Failed to create user' 
      };
    }

    // Expect 201 status for successful creation
    if (response.status !== 201) {
      console.warn('⚠️ Unexpected success status:', response.status);
    }

    console.log('✅ User created successfully:', data.data);
    return { 
      success: true, 
      data: data.data 
    };
  } catch (error) {
    console.error('❌ Create user error:', {
      error,
      payload,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create user' 
    };
  }
} 