'use server'

import { Agent } from '@/lib/types'

export async function getAgents() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL
    const apiKey = process.env.ELIZA_API_KEY

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration')
    }

    const response = await fetch(`${apiUrl}/api/eliza-agent`, {
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
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later')
      }
      throw new Error(data.message || 'Failed to fetch agents')
    }

    return {
      success: true,
      data: data.agents as Agent[]
    }

  } catch (error) {
    console.error('Error fetching agents:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

export async function getAgentById(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL
    const apiKey = process.env.ELIZA_API_KEY

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration')
    }

    const response = await fetch(`${apiUrl}/api/eliza-agent/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key')
      } else if (response.status === 404) {
        throw new Error('Agent not found')
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later')
      }
      throw new Error(data.message || 'Failed to fetch agent')
    }

    return {
      success: true,
      data: data.agent as Agent
    }

  } catch (error) {
    console.error('Error fetching agent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
} 