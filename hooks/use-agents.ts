import { useState, useEffect } from 'react'
import { Agent } from '@/lib/dummy-data'

interface UseAgentsOptions {
  initialData?: Agent[]
  shouldFetch?: boolean
}

export function useAgents({ initialData, shouldFetch = true }: UseAgentsOptions = {}) {
  const [agents, setAgents] = useState<Agent[]>(initialData || [])
  const [isLoading, setIsLoading] = useState(!initialData && shouldFetch)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!shouldFetch) return

    async function fetchAgents() {
      try {
        // TODO: Replace with actual API call when backend is ready
        await new Promise(resolve => setTimeout(resolve, 1000))
        setAgents(initialData || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch agents'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgents()
  }, [initialData, shouldFetch])

  return {
    agents,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true)
      setError(null)
    },
  }
} 