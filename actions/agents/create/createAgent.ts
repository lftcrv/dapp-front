'use server';

import { CharacterConfig } from '@/lib/types';

export async function createAgent(
  name: string,
  characterConfig: CharacterConfig,
  curveSide: 'LEFT' | 'RIGHT',
  creatorAddress: string,
  symbol?: string, // Optional, will be generated on backend if not provided
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL;
    const apiKey = process.env.API_KEY;

    console.log('API URL:', apiUrl);
    console.log('API Key:', apiKey);
    console.log('Creator Wallet:', creatorAddress);

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration');
    }

    if (!creatorAddress) {
      throw new Error('Creator wallet address is required');
    }

    const headers = {
      'Content-Type': 'application/json',

      'x-api-key': apiKey
    }
    // console.log('Request Headers:', headers)


    const requestBody = {
      name,
      symbol: symbol || name.slice(0, 5).toUpperCase(), // Generate symbol if not provided
      characterConfig,
      curveSide,

      creatorWallet: creatorAddress
    }
    // console.log('Request Body:', requestBody)


    const response = await fetch(`${apiUrl}/api/eliza-agent`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });


    // console.log('Response Status:', response.status)
    const data = await response.json()
    // console.log('Response Data:', data)


    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 400) {
        throw new Error(data.message || 'Invalid agent configuration');
      } else if (response.status === 408 || data.message?.includes('timeout')) {
        throw new Error('Agent creation timed out - please try again');
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later');
      }
      throw new Error(data.message || 'Failed to create agent');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error creating agent:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
