'use server'

import { CharacterConfig } from '@/lib/types'

export async function createAgent(
  name: string, 
  characterConfig: CharacterConfig,
  curveSide: 'LEFT' | 'RIGHT'
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL
    const apiKey = process.env.API_KEY

    console.log('API URL:', apiUrl)
    console.log('API Key:', apiKey)

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration')
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    }
    console.log('Request Headers:', headers)

    const response = await fetch(`${apiUrl}/api/eliza-agent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        name, 
        characterConfig,
        curveSide 
      })
    })

    console.log('Response Status:', response.status)
    const data = await response.json()
    console.log('Response Data:', data)

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Invalid API key')
      } else if (response.status === 400) {
        throw new Error(data.message || 'Invalid agent configuration')
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