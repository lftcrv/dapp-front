'use server'

import { CharacterConfig } from '@/lib/types'

export async function createAgent(
  name: string, 
  characterConfig: CharacterConfig,
  curveSide: 'LEFT' | 'RIGHT',
  creatorAddress: string
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL
    const apiKey = process.env.API_KEY

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration')
    }

    if (!creatorAddress) {
      throw new Error('Creator wallet address is required')
    }

    // Ensure the address starts with 0x and is a valid hex string
    const formattedAddress = creatorAddress.startsWith('0x') 
      ? creatorAddress 
      : `0x${creatorAddress}`

    // Validate the address format
    if (!/^0x[a-fA-F0-9]+$/.test(formattedAddress)) {
      throw new Error('Invalid wallet address format')
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    }

    const requestBody = { 
      name, 
      characterConfig,
      curveSide,
      creatorWallet: formattedAddress
    }

    const response = await fetch(`${apiUrl}/api/eliza-agent`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()
    console.log('Response Data:', data)

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Invalid API key')
      } else if (response.status === 400) {
        throw new Error(Array.isArray(data.message) ? data.message[0] : (data.message || 'Invalid agent configuration'))
      } else if (response.status === 408 || data.message?.includes('timeout')) {
        throw new Error('Agent creation timed out - please try again')
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later')
      }
      throw new Error(data.message || 'Failed to create agent')
    }

    return {
      success: true,
      data
    }

  } catch (error) {
    console.error('Error creating agent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
} 