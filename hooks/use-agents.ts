'use client'

import { useEffect } from 'react'
import { Agent } from '@/lib/types'
import { agentService } from '@/lib/services/api/agents'
import { useAsyncState } from '@/lib/core/state'

export function useAgents() {
  const state = useAsyncState<Agent[]>()

  async function fetchAgents() {
    state.setLoading(true)
    const result = await agentService.getAll()
    state.handleResult(result)
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return {
    ...state,
    refetch: fetchAgents
  }
}

export function useAgent({ id, initialData }: { id: string, initialData?: Agent }) {
  const state = useAsyncState<Agent>(initialData)

  useEffect(() => {
    async function fetchAgent() {
      if (initialData) return
      
      state.setLoading(true)
      const result = await agentService.getById(id)
      state.handleResult(result)
    }

    fetchAgent()
  }, [id, initialData])

  return state
} 