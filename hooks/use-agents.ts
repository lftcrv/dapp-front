import { useState, useEffect } from 'react'
import { Agent } from '@/lib/types'
import { agentService } from '@/lib/services/api/agents'

interface UseAgentsOptions {
  type?: 'leftcurve' | 'rightcurve'
  status?: 'bonding' | 'live' | 'ended'
  initialData?: Agent[]
}

interface UseAgentsReturn {
  agents: Agent[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useAgents(options: UseAgentsOptions = {}): UseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>(options.initialData || [])
  const [isLoading, setIsLoading] = useState(!options.initialData)
  const [error, setError] = useState<Error | null>(null)

  const fetchAgents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      let data: Agent[]
      if (options.type) {
        data = await agentService.getAgentsByType(options.type)
      } else if (options.status) {
        data = await agentService.getAgentsByStatus(options.status)
      } else {
        data = await agentService.getAllAgents()
      }
      
      setAgents(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch agents'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [options.type, options.status])

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