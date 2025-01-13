import { useState, useEffect } from 'react'
import { Agent } from '@/lib/types'
import { agentService } from '@/lib/services/agent-service'

/**
 * Configuration options for the useAgents hook
 */
interface UseAgentsOptions {
  /** Initial agent data to populate the state */
  initialData?: Agent[]
  /** Whether to fetch agents from the API */
  shouldFetch?: boolean
}

/**
 * Response type for the useAgents hook
 */
interface UseAgentsResponse {
  /** List of agents */
  agents: Agent[]
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Function to manually trigger a refresh */
  refetch: () => void
}

/**
 * Hook to manage agent data fetching and state
 * @param options - Configuration options
 * @returns Agent data, loading state, error state, and refetch function
 */
export function useAgents({ 
  initialData, 
  shouldFetch = true 
}: UseAgentsOptions = {}): UseAgentsResponse {
  const [agents, setAgents] = useState<Agent[]>(initialData || [])
  const [isLoading, setIsLoading] = useState(!initialData && shouldFetch)
  const [error, setError] = useState<Error | null>(null)

  const fetchAgents = async () => {
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
    if (!shouldFetch) return
    fetchAgents()
  }, [initialData, shouldFetch])

  return {
    agents,
    isLoading,
    error,
    refetch: fetchAgents,
  }
} 