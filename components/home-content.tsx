'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { TopAgentsSkeleton, AgentTableSkeleton } from '@/components/home-skeleton'
import { Agent } from '@/lib/types'

// Preload components during idle time
const TopAgents = dynamic(() => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      import('@/components/top-agents')
    })
  }
  return import('@/components/top-agents').then(mod => mod.TopAgents)
}, {
  loading: () => <TopAgentsSkeleton />,
  ssr: false
})

const AgentTable = dynamic(() => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      import('@/components/agent-table')
    })
  }
  return import('@/components/agent-table').then(mod => mod.AgentTable)
}, {
  loading: () => <AgentTableSkeleton />,
  ssr: false
})

interface HomeContentProps {
  agents: Agent[]
}

export function HomeContent({ agents }: HomeContentProps) {
  return (
    <>
      <Suspense fallback={<TopAgentsSkeleton />}>
        <TopAgents />
      </Suspense>

      <Suspense fallback={<AgentTableSkeleton />}>
        <AgentTable agents={agents} />
      </Suspense>
    </>
  )
} 