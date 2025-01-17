'use server'

import { Trade } from '@/lib/types'

export async function getTrades(agentId?: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL
    const apiKey = process.env.ELIZA_API_KEY

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration')
    }

    const endpoint = agentId 
      ? `${apiUrl}/api/eliza-agent/${agentId}/trades`
      : `${apiUrl}/api/eliza-agent/trades`

    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Invalid API key')
      } else if (response.status === 404) {
        throw new Error('Agent not found')
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later')
      }
      throw new Error(data.message || 'Failed to fetch trades')
    }

    return {
      success: true,
      data: data.trades as Trade[]
    }

  } catch (error) {
    console.error('Error fetching trades:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
} 