'use client'

import { useState, useEffect } from 'react'
import { Agent } from '@/lib/types'
import { agentService } from '@/lib/services/api/agents'

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  async function fetchAgents() {
    try {
      setIsLoading(true)
      setError(null)
      const data = await agentService.getAllAgents()
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch agents'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return {
    agents,
    isLoading,
    error,
    refetch: fetchAgents
  }
}

export function useAgent({ id, initialData }: { id: string, initialData?: Agent }) {
  const [agent, setAgent] = useState<Agent | null>(initialData || null)
  const [isLoading, setIsLoading] = useState(!initialData)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchAgent() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await agentService.getAgentById(id)
        setAgent(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch agent'))
      } finally {
        setIsLoading(false)
      }
    }

    if (!initialData) {
      fetchAgent()
    }
  }, [id, initialData])

  return { agent, isLoading, error }
} 