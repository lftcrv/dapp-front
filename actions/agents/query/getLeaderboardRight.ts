'use server'

import { Agent } from '@/lib/types'

export async function getLeaderboardRight(limit: number = 10) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL
    const apiKey = process.env.ELIZA_API_KEY

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration')
    }

    const response = await fetch(`${apiUrl}/api/leaderboard/right-curve?limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key')
      } else if (response.status >= 500) {
        throw new Error('Server error - please try again later')
      }
      throw new Error(data.message || 'Failed to fetch right leaderboard')
    }

    return {
      success: true,
      data: data.agents as Agent[]
    }

  } catch (error) {
    console.error('Error fetching right leaderboard:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
} 