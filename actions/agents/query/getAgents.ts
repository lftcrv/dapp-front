'use server'

import { Agent } from '@/lib/types'

interface ApiAgent {
  id: string
  name: string
  curveSide: 'LEFT' | 'RIGHT'
  status: 'STARTING' | 'RUNNING' | 'STOPPED'
  createdAt: string
  degenScore: number
  winScore: number
  LatestMarketData: {
    price: number
    marketCap: number
    holders: number
  } | null
}

function mapApiAgentToAgent(apiAgent: ApiAgent): Agent {
  return {
    id: apiAgent.id,
    name: apiAgent.name,
    symbol: apiAgent.name.substring(0, 4).toUpperCase(), // Generate a symbol from name
    type: apiAgent.curveSide === 'LEFT' ? 'leftcurve' : 'rightcurve',
    status: apiAgent.status === 'STARTING' ? 'bonding' : 'live',
    price: apiAgent.LatestMarketData?.price || 0,
    marketCap: apiAgent.LatestMarketData?.marketCap || 0,
    holders: apiAgent.LatestMarketData?.holders || 0,
    creator: 'unknown', // Add default value
    createdAt: apiAgent.createdAt,
    creativityIndex: apiAgent.degenScore || 0,
    performanceIndex: apiAgent.winScore || 0
  }
}

export async function getAgents() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL
    const apiKey = process.env.API_KEY

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration')
    }
    
    const response = await fetch(`${apiUrl}/api/eliza-agent`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      // Add caching for 10 seconds
      next: { revalidate: 10 }
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

    const mappedAgents = data.data.agents.map(mapApiAgentToAgent)

    return {
      success: true,
      data: mappedAgents
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

export async function getAgentById(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL
    const apiKey = process.env.API_KEY

    if (!apiUrl || !apiKey) {
      throw new Error('Missing API configuration')
    }

    const response = await fetch(`${apiUrl}/api/eliza-agent/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      next: { revalidate: 5 }
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

    const mappedAgent = mapApiAgentToAgent(data.data.agent)

    return {
      success: true,
      data: mappedAgent
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
} 