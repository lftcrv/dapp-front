'use server'

import { CharacterConfig } from '../types/agent'

interface CreateAgentResponse {
  success: boolean
  agent?: {
    name: string
    characterConfig: CharacterConfig
  }
  error?: string
}

export async function createAgent(
  name: string, 
  characterConfig: CharacterConfig
): Promise<CreateAgentResponse> {
  try {
    const apiKey = process.env.ELIZA_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL

    if (!apiKey || !apiUrl) {
      throw new Error('Missing API configuration')
    }

    const response = await fetch(`${apiUrl}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ name, characterConfig })
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key')
      } else if (response.status === 400) {
        throw new Error('Invalid agent configuration')
      } else if (response.status >= 500) {
        throw new Error('Server error')
      } else {
        throw new Error('Failed to create agent')
      }
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('Error in createAgent action:', error)
    throw error instanceof Error ? error : new Error('An unexpected error occurred')
  }
} 